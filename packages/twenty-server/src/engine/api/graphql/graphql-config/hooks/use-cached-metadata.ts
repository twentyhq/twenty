import { createHash } from 'crypto';

import { isDefined } from 'class-validator';
import { Plugin } from 'graphql-yoga';

export type CacheMetadataPluginConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheGetter: (key: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: string[];
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computeCacheKey = (serverContext: any) => {
    const workspaceId = serverContext.req.workspace?.id ?? 'anonymous';
    const workspaceMetadataVersion =
      serverContext.req.workspaceMetadataVersion ?? '0';
    const operationName = getOperationName(serverContext);
    const locale = serverContext.req.headers['x-locale'] ?? '';
    const localeCacheKey = isDefined(serverContext.req.headers['x-locale'])
      ? `:${locale}`
      : '';
    const queryHash = createHash('sha256')
      .update(serverContext.req.body.query)
      .digest('hex');

    return `graphql:operations:${operationName}:${workspaceId}:${workspaceMetadataVersion}${localeCacheKey}:${queryHash}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      if (!config.operationsToCache.includes(getOperationName(serverContext))) {
        return;
      }

      const cacheKey = computeCacheKey(serverContext);
      const cachedResponse = await config.cacheGetter(cacheKey);

      if (cachedResponse) {
        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onResponse: async ({ response, serverContext }) => {
      if (!config.operationsToCache.includes(getOperationName(serverContext))) {
        return;
      }

      const cacheKey = computeCacheKey(serverContext);

      const cachedResponse = await config.cacheGetter(cacheKey);

      if (!cachedResponse) {
        const responseBody = await response.json();

        if (responseBody.errors) {
          return;
        }

        config.cacheSetter(cacheKey, responseBody);
      }
    },
  };
}
