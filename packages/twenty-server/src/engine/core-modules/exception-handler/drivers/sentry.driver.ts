import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { ExceptionHandlerOptions } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-options.interface';
import { ExceptionHandlerUser } from 'src/engine/core-modules/exception-handler/interfaces/exception-handler-user.interface';

import {
  ExceptionHandlerDriverInterface,
  ExceptionHandlerSentryDriverFactoryOptions,
} from 'src/engine/core-modules/exception-handler/interfaces';
import { WorkspaceCacheKeys } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export class ExceptionHandlerSentryDriver
  implements ExceptionHandlerDriverInterface
{
  constructor(options: ExceptionHandlerSentryDriverFactoryOptions['options']) {
    Sentry.init({
      environment: options.environment,
      release: options.release,
      dsn: options.dsn,
      integrations: [
        // TODO: Redis integration doesn't seem to work - investigate why
        Sentry.redisIntegration({
          cachePrefixes: Object.values(WorkspaceCacheKeys).map(
            (key) => `engine:${key}:`,
          ),
        }),
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        Sentry.graphqlIntegration(),
        Sentry.postgresIntegration(),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.3,
      debug: options.debug,
    });
  }

  captureExceptions(
    exceptions: ReadonlyArray<any>,
    options?: ExceptionHandlerOptions,
  ) {
    const eventIds: string[] = [];

    Sentry.withScope((scope) => {
      if (options?.operation) {
        scope.setTag('operation', options.operation.name);
        scope.setTag('operationName', options.operation.name);
      }

      if (options?.document) {
        scope.setExtra('document', options.document);
      }

      if (options?.user) {
        scope.setUser({
          id: options.user.id,
          email: options.user.email,
          firstName: options.user.firstName,
          lastName: options.user.lastName,
          workspaceId: options.user.workspaceId,
          workspaceDisplayName: options.user.workspaceDisplayName,
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

        const eventId = Sentry.captureException(exception, {
          fingerprint: [
            'graphql',
            errorPath,
            options?.operation?.name,
            options?.operation?.type,
          ],
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

  captureMessage(message: string, user?: ExceptionHandlerUser) {
    Sentry.captureMessage(message, (scope) => {
      if (user) {
        scope.setUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          workspaceId: user.workspaceId,
          workspaceDisplayName: user.workspaceDisplayName,
        });
      }

      return scope;
    });
  }
}
