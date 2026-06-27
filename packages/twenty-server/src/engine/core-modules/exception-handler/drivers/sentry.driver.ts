import * as Sentry from '@sentry/node';
import {
  getGenericOperationName,
  getHumanReadableNameFromCode,
  isDefined,
} from 'twenty-shared/utils';

import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';
import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { CustomException } from 'src/utils/custom-exception';

export class ExceptionHandlerSentryDriver implements ExceptionHandlerDriverInterface {
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
        const workspaceMigrationRunnerUnderlyingError =
          exception instanceof WorkspaceMigrationRunnerException
            ? (exception.errors?.metadata ??
              exception.errors?.workspaceSchema ??
              exception.errors?.actionTranspilation)
            : undefined;

        if (workspaceMigrationRunnerUnderlyingError instanceof QueryFailedError) {
          const queryFailedError = workspaceMigrationRunnerUnderlyingError as QueryFailedError & {
            code?: string;
            driverError?: { code?: string };
          };

          const postgresErrorCode =
            queryFailedError.code ?? queryFailedError.driverError?.code;

          if (
            postgresErrorCode ===
            POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION
          ) {
            continue;
          }
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

        if (exception instanceof WorkspaceMigrationRunnerException) {
          const metadataName = exception.action?.metadataName ?? 'unknown';
          const actionType = exception.action?.type ?? 'unknown';

          scope.setTag('workspaceMigrationRunnerCode', exception.code);
          scope.setTag('workspaceMigrationMetadataName', metadataName);
          scope.setTag('workspaceMigrationActionType', actionType);

          let postgresErrorCode = 'none';

          if (workspaceMigrationRunnerUnderlyingError instanceof QueryFailedError) {
            const queryFailedError = workspaceMigrationRunnerUnderlyingError as QueryFailedError & {
              code?: string;
              driverError?: { code?: string };
            };

            postgresErrorCode =
              queryFailedError.code ?? queryFailedError.driverError?.code ?? 'none';

            scope.setTag('postgresSqlErrorCode', postgresErrorCode);
          }

          scope.setFingerprint([
            'workspace-migration-runner',
            exception.code,
            metadataName,
            actionType,
            postgresErrorCode,
          ]);
        }

        if (
          exception instanceof CustomException &&
          exception.code !== 'UNKNOWN' &&
          !(exception instanceof WorkspaceMigrationRunnerException)
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
