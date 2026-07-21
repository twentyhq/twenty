import { createHash } from 'crypto';

import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: string[];
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = ({
    operationName,
    request,
  }: {
    operationName: string;
    request: Pick<Request, 'workspace' | 'locale' | 'body' | 'userWorkspaceId'>;
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

    if (operationName === 'FindAllViews') {
      return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${request.userWorkspaceId}:${queryHash}`;
    }

    return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${locale}:${queryHash}`;
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  const cacheHitRequests = new WeakSet<Request>();

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

      if (!request.workspace?.id) {
        return;
      }

      const operationName = getOperationName(serverContext);

      if (!config.operationsToCache.includes(operationName)) {
        return;
      }

      Sentry.setTags({ operationName, operation: 'query' });
      Sentry.getCurrentScope().setTransactionName(operationName);

      const cacheKey = computeCacheKey({
        operationName,
        request,
      });
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

      if (!config.operationsToCache.includes(operationName)) {
        return;
      }

      if (cacheHitRequests.delete(request)) {
        return;
      }

      const cacheKey = computeCacheKey({
        operationName,
        request,
      });

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
