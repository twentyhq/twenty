import * as Sentry from '@sentry/node';
import {
  getGenericOperationName,
  getHumanReadableNameFromCode,
  isDefined,
} from 'twenty-shared/utils';

import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { CustomException } from 'src/utils/custom-exception';

export class ExceptionHandlerSentryDriver
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
