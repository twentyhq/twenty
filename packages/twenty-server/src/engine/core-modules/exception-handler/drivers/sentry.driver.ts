import * as Sentry from '@sentry/node';
import {
  getGenericOperationName,
  getHumanReadableNameFromCode,
  isDefined,
} from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
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
  'SCHEMA_VERSION_MISMATCH',
  'APP_VERSION_MISMATCH',
]);

export class ExceptionHandlerSentryDriver implements ExceptionHandlerDriverInterface {
  private shouldSkipCapture(
    exception: unknown,
    options?: ExceptionHandlerOptions,
  ): boolean {
    const exceptionWithMetadata =
      typeof exception === 'object' && exception
        ? (exception as {
            code?: string;
            extensions?: {
              code?: string;
              exception?: { code?: string };
            };
            path?: (string | number)[];
          })
        : undefined;

    const graphQLErrorCode = exceptionWithMetadata?.extensions?.code;

    if (
      graphQLErrorCode &&
      filteredGraphQLErrorCodes.has(graphQLErrorCode)
    ) {
      return true;
    }

    if (
      exceptionWithMetadata?.code ===
        POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION ||
      exceptionWithMetadata?.extensions?.exception?.code ===
        POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION
    ) {
      return true;
    }

    const operationName = options?.operation?.name;

    const isMessagingFindOperation = [
      'FindManyMessages',
      'FindOneMessage',
      'FindMessagesFromCompanyId',
      'FindMessagesFromPersonIds',
      'FindMessagesFromOpportunityId',
    ].includes(operationName ?? '');

    if (!isMessagingFindOperation || !exceptionWithMetadata) {
      return false;
    }

    if (exceptionWithMetadata.extensions?.code === ErrorCode.NOT_FOUND) {
      return true;
    }

    return exceptionWithMetadata.path?.includes('visibility') ?? false;
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
        if (this.shouldSkipCapture(exception, options)) {
          scope.addBreadcrumb({
            category: 'sentry.filter',
            level: 'debug',
            message: 'Filtered non-actionable GraphQL error',
          });

          continue;
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
