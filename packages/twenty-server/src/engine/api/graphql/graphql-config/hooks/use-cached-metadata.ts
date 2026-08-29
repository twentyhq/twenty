import { createHash } from 'crypto';

import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type CachedOperationConfig = {
  dependencies: WorkspaceCacheKeyName[];
  scope: 'workspace' | 'userWorkspace';
};

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: Record<string, CachedOperationConfig>;
  dependencyHashGetter: (
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheKeyName[],
  ) => Promise<string>;
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = async ({
    operationName,
    operationConfig,
    workspaceId,
    request,
  }: {
    operationName: string;
    operationConfig: CachedOperationConfig;
    workspaceId: string;
    request: Pick<Request, 'locale' | 'body' | 'userWorkspaceId'>;
  }): Promise<string> => {
    const dependencyHash = await config.dependencyHashGetter(
      workspaceId,
      operationConfig.dependencies,
    );
    const queryHash = createHash('sha256')
      .update(request.body.query)
      .update(JSON.stringify(request.body.variables ?? null))
      .digest('hex');
    const userScopeSegment =
      operationConfig.scope === 'userWorkspace'
        ? `:${request.userWorkspaceId}`
        : '';

    return `graphql:operations:${operationName}:${workspaceId}:${dependencyHash}${userScopeSegment}:${request.locale}:${queryHash}`;
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  const getOperationCacheConfig = (
    operationName: unknown,
  ): CachedOperationConfig | undefined =>
    typeof operationName === 'string' &&
    Object.prototype.hasOwnProperty.call(
      config.operationsToCache,
      operationName,
    )
      ? config.operationsToCache[operationName]
      : undefined;

  const cacheHitRequests = new WeakSet<Request>();
  const requestCacheKeys = new WeakMap<Request, string | null>();

  const resolveCacheKey = async ({
    operationName,
    operationConfig,
    workspaceId,
    request,
  }: {
    operationName: string;
    operationConfig: CachedOperationConfig;
    workspaceId: string;
    request: Request;
  }): Promise<string | null> => {
    let cacheKey: string | null;

    try {
      cacheKey = await computeCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
      });
    } catch (error) {
      Sentry.captureException(error);
      cacheKey = null;
    }

    requestCacheKeys.set(request, cacheKey);

    return cacheKey;
  };

  const getCachedResponse = ({
    cacheKey,
    operationName,
    phase,
  }: {
    cacheKey: string;
    operationName: string;
    phase: 'request' | 'response';
  }) =>
    Sentry.startSpan(
      {
        name: 'metadata GraphQL cache lookup',
        op: 'cache.get',
        onlyIfParent: true,
        attributes: {
          'cache.phase': phase,
          'graphql.operation.name': operationName,
          'graphql.operation.type': 'query',
        },
      },
      async (span) => {
        const cachedResponse = await config.cacheGetter(cacheKey);

        span.setAttribute('cache.hit', Boolean(cachedResponse));

        return cachedResponse;
      },
    );

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      // TODO: we should probably override the graphql-yoga request type to include the workspace and locale
      const request = (serverContext as unknown as { req: Request }).req;
      const workspaceId = request.workspace?.id;

      if (!workspaceId) {
        return;
      }

      const operationName = getOperationName(serverContext);
      const operationConfig = getOperationCacheConfig(operationName);

      if (!isDefined(operationConfig)) {
        return;
      }

      Sentry.setTags({ operationName, operation: 'query' });
      Sentry.getCurrentScope().setTransactionName(operationName);

      const cacheKey = await resolveCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
      });

      if (!isDefined(cacheKey)) {
        return;
      }

      const cachedResponse = await getCachedResponse({
        cacheKey,
        operationName,
        phase: 'request',
      });

      if (cachedResponse) {
        cacheHitRequests.add(request);

        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onResponse: async ({ response, serverContext }) => {
      const request = (serverContext as unknown as { req: Request }).req;

      if (!request.workspace?.id) {
        return;
      }

      const operationName = getOperationName(serverContext);

      if (!isDefined(getOperationCacheConfig(operationName))) {
        return;
      }

      if (cacheHitRequests.delete(request)) {
        return;
      }

      const cacheKey = requestCacheKeys.get(request);

      if (!isDefined(cacheKey)) {
        return;
      }

      const cachedResponse = await getCachedResponse({
        cacheKey,
        operationName,
        phase: 'response',
      });

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
