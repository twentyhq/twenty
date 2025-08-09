import { type GraphQLResolveInfo } from 'graphql';
import { getGraphQLRateLimiter } from 'graphql-rate-limit';
import { type Plugin } from '@envelop/core';
import { useOnResolve } from '@envelop/on-resolve';

import { type GraphQLContext } from 'src/engine/api/graphql/graphql-config/graphql-config.service';

export class UnauthenticatedError extends Error {}

export type IdentifyFn<ContextType = ThrottlerContext> = (
  context: ContextType,
) => string;

export type ThrottlerPluginOptions = {
  identifyFn: IdentifyFn;
  ttl?: number;
  limit?: number;
  transformError?: (message: string) => Error;
  onThrottlerError?: (event: {
    error: string;
    identifier: string;
    context: unknown;
    info: GraphQLResolveInfo;
  }) => void;
};

interface ThrottlerContext extends GraphQLContext {
  rateLimiterFn: ReturnType<typeof getGraphQLRateLimiter>;
}

export const useThrottler = (
  options: ThrottlerPluginOptions,
): Plugin<ThrottlerContext> => {
  const rateLimiterFn = getGraphQLRateLimiter({
    identifyContext: options.identifyFn,
  });

  return {
    onPluginInit({ addPlugin }) {
      addPlugin(
        useOnResolve(async ({ args, root, context, info }) => {
          if (options.limit && options.ttl) {
            if (root !== undefined) {
              return;
            }

            const id = options.identifyFn(context);

            const errorMessage = await context.rateLimiterFn(
              { parent: root, args, context, info },
              {
                max: options?.limit,
                window: `${options?.ttl}s`,
                message: interpolate('Too many requests.', {
                  id,
                }),
              },
            );

            if (errorMessage) {
              if (options.onThrottlerError) {
                options.onThrottlerError({
                  error: errorMessage,
                  identifier: id,
                  context,
                  info,
                });
              }

              if (options.transformError) {
                throw options.transformError(errorMessage);
              }

              throw new Error(errorMessage);
            }
          }
        }),
      );
    },
    async onContextBuilding({ extendContext }) {
      extendContext({
        rateLimiterFn,
      });
    },
  };
};

function interpolate(message: string, args: { [key: string]: string }) {
  return message.replace(/\{{([^)]*)\}}/g, (_, key) => args[key.trim()]);
}
