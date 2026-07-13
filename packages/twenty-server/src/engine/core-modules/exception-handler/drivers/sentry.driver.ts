import * as Sentry from '@sentry/node';
import {
  getGenericOperationName,
  getHumanReadableNameFromCode,
  isDefined,
} from 'twenty-shared/utils';

import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { CacheLockAcquisitionError } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { EventStreamExceptionCode } from 'src/engine/subscriptions/event-stream.exception';
import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { CustomException } from 'src/utils/custom-exception';

const filteredGraphQLErrorCodes = new Set<string>([
  ErrorCode.GRAPHQL_VALIDATION_FAILED,
  ErrorCode.UNAUTHENTICATED,
  ErrorCode.FORBIDDEN,
  ErrorCode.NOT_FOUND,
  ErrorCode.METHOD_NOT_ALLOWED,
  ErrorCode.TIMEOUT,
  ErrorCode.CONFLICT,
  ErrorCode.BAD_USER_INPUT,
  ErrorCode.METADATA_VALIDATION_FAILED,
]);

const filteredGraphQLErrorSubCodes = new Set<string>([
  EventStreamExceptionCode.EVENT_STREAM_ALREADY_EXISTS,
  EventStreamExceptionCode.NOT_AUTHORIZED,
]);

export class ExceptionHandlerSentryDriver implements ExceptionHandlerDriverInterface {
  private shouldSkipCapture(exception: unknown): boolean {
    const exceptionWithMetadata =
      typeof exception === 'object' && exception
        ? (exception as {
            extensions?: {
              code?: string;
              subCode?: string;
            };
          })
        : undefined;

    const graphQLErrorCode = exceptionWithMetadata?.extensions?.code;
    const graphQLErrorSubCode =
      exceptionWithMetadata?.extensions?.subCode ??
      (exception instanceof CustomException ? exception.code : undefined);

    return Boolean(
      (graphQLErrorCode && filteredGraphQLErrorCodes.has(graphQLErrorCode)) ||
        (graphQLErrorSubCode &&
          filteredGraphQLErrorSubCodes.has(graphQLErrorSubCode)),
    );
  }

  captureExceptions(
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ) {
    const eventIds: string[] = [];

    Sentry.withScope((scope) => {
      if (options?.operation) {
        scope.setExtra('operation', options.operation.name);
        scope.setExtra('operationType', options.operation.type);
        scope.setTag('graphql.operation', options.operation.name);
        scope.setTag('graphql.operation_type', options.operation.type);
      }

      if (options?.document) {
        scope.setExtra('document', options.document);
      }

      if (options?.workspace) {
        scope.setExtra('workspace', options.workspace);
      }

      if (options?.additionalData) {
        scope.setExtra('additionalData', options.additionalData);
      }

      if (options?.user) {
        scope.setUser({
          id: options.user.id,
          email: options.user.email,
          firstName: options.user.firstName,
          lastName: options.user.lastName,
        });
      }

      for (const exception of exceptions) {
        if (this.shouldSkipCapture(exception)) {
          scope.addBreadcrumb({
            category: 'sentry.filter',
            level: 'debug',
            message: 'Filtered non-actionable GraphQL error',
          });

          continue;
        }

        const exceptionWithMetadata =
          typeof exception === 'object' && exception
            ? (exception as {
                extensions?: {
                  code?: string;
                  subCode?: string;
                };
              })
            : undefined;

        const graphQLErrorCode = exceptionWithMetadata?.extensions?.code;
        const graphQLErrorSubCode =
          exceptionWithMetadata?.extensions?.subCode ??
          (exception instanceof CustomException ? exception.code : undefined);

        if (graphQLErrorCode) {
          scope.setTag('graphql.error_code', graphQLErrorCode);
        }

        if (graphQLErrorSubCode) {
          scope.setTag('graphql.error_sub_code', graphQLErrorSubCode);
        }

        if (exception instanceof CacheLockAcquisitionError) {
          scope.setTag('cache_lock.error', 'acquisition_timeout');
          scope.setContext('cache_lock', {
            maxRetries: exception.maxRetries,
            retryDelayMs: exception.ms,
            ttlMs: exception.ttl,
          });
        }

        const errorPath = (exception.path ?? [])
          .map((v: string | number) => (typeof v === 'number' ? '$index' : v))
          .join(' > ');

        if (errorPath) {
          scope.addBreadcrumb({
            category: 'execution-path',
            message: errorPath,
            level: 'debug',
          });
        }

        if ('context' in exception && exception.context) {
          Object.entries(exception.context).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }

        if ('cause' in exception && exception.cause) {
          scope.setContext('cause', {
            name: exception.cause.name,
            message: exception.cause.message,
            stack: exception.cause.stack,
          });
        }

        if (
          exception instanceof CustomException &&
          exception.code !== 'UNKNOWN'
        ) {
          scope.setTag('customExceptionCode', exception.code);
          scope.setFingerprint([exception.code]);
          exception.name = getHumanReadableNameFromCode(exception.code);
        }

        if (exception instanceof PostgresException) {
          scope.setTag('postgresSqlErrorCode', exception.code);
          const fingerPrint = [exception.code];
          const genericOperationName = getGenericOperationName(
            options?.operation?.name,
          );

          if (isDefined(genericOperationName)) {
            fingerPrint.push(genericOperationName);
          }
          scope.setFingerprint(fingerPrint);
          exception.name = exception.message;
        }

        if (exception instanceof MessageImportDriverException) {
          scope.setTag('messageImportDriverCode', exception.code);
          scope.setFingerprint([exception.code]);
        }

        const eventId = Sentry.captureException(exception, {
          contexts: {
            GraphQL: {
              operationName: options?.operation?.name,
              operationType: options?.operation?.type,
            },
          },
        });

        eventIds.push(eventId);
      }
    });

    return eventIds;
  }
}
