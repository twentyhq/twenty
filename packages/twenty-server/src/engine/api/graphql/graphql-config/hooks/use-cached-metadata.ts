import { Plugin } from 'graphql-yoga';

export function useCachedMetadata(
  cacheGetter: (key: string) => any,
  cacheSetter: (key: string, value: any) => void,
): Plugin {
  const computeCacheKey = (serverContext: any) => {
    const workspaceId = serverContext.req.workspace?.id ?? 'anonymous';
    const cacheVersion = serverContext.req.cacheVersion ?? '0';

    return `${workspaceId}:${cacheVersion}`;
  };

  const operationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      if (operationName(serverContext) !== 'ObjectMetadataItems') {
        return;
      }

      const cacheKey = computeCacheKey(serverContext);
      const cachedResponse = await cacheGetter(cacheKey);

      if (cachedResponse) {
        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onResponse: async ({ response, serverContext }) => {
      const cacheKey = computeCacheKey(serverContext);

      const cachedResponse = await cacheGetter(cacheKey);

      if (!cachedResponse) {
        const responseBody = await response.json();

        cacheSetter(cacheKey, responseBody);
      }
    },
  };
}
