import { Plugin } from 'graphql-yoga';

export function useCachedMetadata(): Plugin {
  const cache = new Map<string, any>();

  const computeCacheKey = (serverContext: any) => {
    const workspaceId = serverContext.req.workspace?.id ?? 'anonymous';
    const cacheVersion = serverContext.req.cacheVersion ?? '0';

    return `${workspaceId}:${cacheVersion}`;
  };

  return {
    onRequest: ({ endResponse, serverContext }) => {
      const cacheKey = computeCacheKey(serverContext);
      const foundInCache = cache.has(cacheKey);

      if (foundInCache) {
        const cachedResponse = cache.get(cacheKey);

        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onResponse: async ({ response, serverContext }) => {
      const cacheKey = computeCacheKey(serverContext);

      const foundInCache = cache.has(cacheKey);

      if (!foundInCache) {
        const responseBody = await response.json();

        cache.set(cacheKey, responseBody);
      }
    },
  };
}
