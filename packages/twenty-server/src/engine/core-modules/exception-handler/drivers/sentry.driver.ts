import * as Sentry from '@sentry/node';
import { QueryFailedError } from 'typeorm';
import {
  getGenericOperationName,
  getHumanReadableNameFromCode,
  isDefined,
} from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';
import { type ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { CustomException } from 'src/utils/custom-exception';

const filteredGraphQLErrorCodes = new Set<string>([
  'GRAPHQL_VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'TIMEOUT',
  'CONFLICT',
  'BAD_USER_INPUT',
  'METADATA_VALIDATION_FAILED',
  'SCHEMA_VERSION_MISMATCH',
  'APP_VERSION_MISMATCH',
]);

const getQueryFailedErrorMetadata = (
  exception: unknown,
): {
  code: string | undefined;
  table: string | undefined;
  column: string | undefined;
  query: string | undefined;
} | undefined => {
  if (!(exception instanceof QueryFailedError)) {
    return undefined;
  }

  const driverError = exception.driverError as Error & {
    code?: string;
    table?: string;
    column?: string;
  };

  return {
    code: driverError.code,
    table: driverError.table,
    column: driverError.column,
    query: exception.query,
  };
};

export class ExceptionHandlerSentryDriver implements ExceptionHandlerDriverInterface {
  private shouldSkipCapture(exception: unknown): boolean {
    const queryFailedErrorMetadata =
      getQueryFailedErrorMetadata(exception);

    if (
      queryFailedErrorMetadata?.code ===
      POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION
    ) {
      return true;
    }

    if (typeof exception !== 'object' || exception === null) {
      return false;
    }

    const exceptionWithMetadata = exception as {
      extensions?: {
        code?: string;
        exception?: { code?: string };
      };
    };

    if (
      exceptionWithMetadata.extensions?.code &&
      filteredGraphQLErrorCodes.has(exceptionWithMetadata.extensions.code)
    ) {
      return true;
    }

    return (
      exceptionWithMetadata.extensions?.exception?.code ===
      POSTGRESQL_ERROR_CODES.INVALID_TEXT_REPRESENTATION
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
            message: 'Filtered expected exception',
          });

          continue;
        }

        const queryFailedErrorMetadata =
          getQueryFailedErrorMetadata(exception);

        if (queryFailedErrorMetadata?.code) {
          scope.setTag('postgresSqlErrorCode', queryFailedErrorMetadata.code);
        }

        if (
          queryFailedErrorMetadata?.code ===
          POSTGRESQL_ERROR_CODES.UNDEFINED_COLUMN
        ) {
          scope.setTag('databaseSchemaMismatch', 'missing-column');
          scope.setFingerprint([
            'database-schema-mismatch',
            queryFailedErrorMetadata.code,
          ]);
          scope.setContext('databaseSchemaMismatch', {
            code: queryFailedErrorMetadata.code,
            table: queryFailedErrorMetadata.table,
            column: queryFailedErrorMetadata.column,
            query: queryFailedErrorMetadata.query,
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
