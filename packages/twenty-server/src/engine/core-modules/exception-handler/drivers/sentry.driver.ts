import * as Sentry from '@sentry/node';

import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';

import { ExceptionHandlerDriverInterface } from 'src/engine/core-modules/exception-handler/interfaces';
import { CustomException } from 'src/utils/custom-exception';

export class ExceptionHandlerSentryDriver
  implements ExceptionHandlerDriverInterface
{
  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ) {
    const eventIds: string[] = [];

    Sentry.withScope((scope) => {
      if (options?.operation) {
        scope.setExtra('operation', options.operation.name);
      }

      if (options?.document) {
        scope.setExtra('document', options.document);
      }

      if (options?.workspace) {
        scope.setExtra('workspace', options.workspace);
      }

      if (options?.messageChannel) {
        scope.setExtra('messageChannel', options.messageChannel);
      }

      if (options?.calendarChannel) {
        scope.setExtra('calendarChannel', options.calendarChannel);
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

        if (exception instanceof CustomException) {
          scope.setTag('customExceptionCode', exception.code);
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
