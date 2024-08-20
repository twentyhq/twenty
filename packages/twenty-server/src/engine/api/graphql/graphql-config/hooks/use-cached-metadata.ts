import { Plugin } from 'graphql-yoga';

export type CacheMetadataPluginConfig = {
  cacheGetter: (key: string) => any;
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: string[];
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = (serverContext: any) => {
    const workspaceId = serverContext.req.workspace?.id ?? 'anonymous';
    const workspaceMetadataVersion =
      serverContext.req.workspaceMetadataVersion ?? '0';
    const operationName = getOperationName(serverContext);

    return `graphql:operations:${operationName}:${workspaceId}:${workspaceMetadataVersion}`;
  };

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
