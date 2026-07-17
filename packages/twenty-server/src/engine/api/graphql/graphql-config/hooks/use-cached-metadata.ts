import { createHash } from 'crypto';

import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  dependencyVersionGetters?: Partial<
    Record<string, (workspaceId: string) => Promise<string | undefined>>
  >;
  operationsToCache: string[];
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = async ({
    operationName,
    request,
  }: {
    operationName: string;
    request: Pick<Request, 'workspace' | 'locale' | 'body' | 'userWorkspaceId'>;
  }): Promise<string | undefined> => {
    const workspace = request.workspace;

    if (!isDefined(workspace)) {
      throw new InternalServerError('Workspace is not defined');
    }

    const workspaceMetadataVersion = workspace.metadataVersion ?? '0';
    const locale = request.locale;
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          query: request.body.query,
          variables: request.body.variables ?? null,
        }),
      )
      .digest('hex');
    const dependencyVersionGetter =
      config.dependencyVersionGetters?.[operationName];
    const dependencyVersion = await dependencyVersionGetter?.(workspace.id);

    if (isDefined(dependencyVersionGetter) && !isDefined(dependencyVersion)) {
      return undefined;
    }

    if (operationName === 'FindAllViews') {
      return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${dependencyVersion}:${request.userWorkspaceId}:${locale}:${requestHash}`;
    }

    return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${locale}:${requestHash}`;
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  const cacheKeyByRequest = new WeakMap<object, Promise<string | undefined>>();

  const getCacheKey = ({
    operationName,
    request,
  }: {
    operationName: string;
    request: Pick<Request, 'workspace' | 'locale' | 'body' | 'userWorkspaceId'>;
  }): Promise<string | undefined> => {
    const cachedKey = cacheKeyByRequest.get(request);

    if (isDefined(cachedKey)) {
      return cachedKey;
    }

    const cacheKey = computeCacheKey({ operationName, request });

    cacheKeyByRequest.set(request, cacheKey);

    return cacheKey;
  };

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      // TODO: we should probably override the graphql-yoga request type to include the workspace and locale
      const request = (serverContext as unknown as { req: Request }).req;

      if (!request.workspace?.id) {
        return;
      }

      if (!config.operationsToCache.includes(getOperationName(serverContext))) {
        return;
      }

      const cacheKey = await getCacheKey({
        operationName: getOperationName(serverContext),
        request,
      });

      if (!isDefined(cacheKey)) {
        return;
      }

      const cachedResponse = await config.cacheGetter(cacheKey);

      if (cachedResponse) {
        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onResponse: async ({ response, serverContext }) => {
      const request = (serverContext as unknown as { req: Request }).req;

      if (!request.workspace?.id) {
        return;
      }

      if (!config.operationsToCache.includes(getOperationName(serverContext))) {
        return;
      }

      const cacheKey = await getCacheKey({
        operationName: getOperationName(serverContext),
        request,
      });

      if (!isDefined(cacheKey)) {
        return;
      }

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
