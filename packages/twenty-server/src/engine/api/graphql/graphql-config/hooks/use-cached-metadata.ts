import { createHash } from 'crypto';

import { Request } from 'express';
import { Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type CacheMetadataPluginConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheGetter: (key: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: string[];
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = ({
    operationName,
    request,
  }: {
    operationName: string;
    request: Pick<Request, 'workspace' | 'locale' | 'body'>;
  }) => {
    const workspace = request.workspace;

    if (!isDefined(workspace)) {
      throw new InternalServerError('Workspace is not defined');
    }

    const workspaceMetadataVersion = workspace.metadataVersion ?? '0';
    const locale = request.locale;
    const queryHash = createHash('sha256')
      .update(request.body.query)
      .digest('hex');

    return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${locale}:${queryHash}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      if (!config.operationsToCache.includes(getOperationName(serverContext))) {
        return;
      }

      const cacheKey = computeCacheKey({
        operationName: getOperationName(serverContext),
        // TODO: we should probably override the graphql-yoga request type to include the workspace and locale
        request: (serverContext as unknown as { req: Request }).req,
      });
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

      const cacheKey = computeCacheKey({
        operationName: getOperationName(serverContext),
        request: (serverContext as unknown as { req: Request }).req,
      });

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
