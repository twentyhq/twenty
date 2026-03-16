import { Logger } from '@nestjs/common';
import { createHash } from 'crypto';

import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { warnIfSlowDuration } from 'src/engine/core-modules/observability/utils/slow-path-observer.util';

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: string[];
};

const USER_SCOPED_METADATA_OPERATIONS = new Set([
  'FindAllViews',
  'FindFieldsWidgetCoreViews',
]);
const SLOW_METADATA_CACHE_MISS_MS = 1_000;
const logger = new Logger('CachedMetadata');

type ObservedMetadataRequest = Request & {
  metadataCacheMissStartedAt?: number;
  metadataCacheMissOperationName?: string;
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

    // Core-view visibility is user-dependent, so these responses must stay user-scoped.
    if (USER_SCOPED_METADATA_OPERATIONS.has(operationName)) {
      return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${request.userWorkspaceId}:${queryHash}`;
    }

    return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${locale}:${queryHash}`;
  };

  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  return {
    onRequest: async ({ endResponse, serverContext }) => {
      // TODO: we should probably override the graphql-yoga request type to include the workspace and locale
      const request = (
        serverContext as unknown as { req: ObservedMetadataRequest }
      ).req;
      const operationName = getOperationName(serverContext);

      if (!request.workspace?.id) {
        return;
      }

      if (!config.operationsToCache.includes(operationName)) {
        return;
      }

      const cacheKey = computeCacheKey({
        operationName,
        request,
      });
      const cachedResponse = await config.cacheGetter(cacheKey);

      if (cachedResponse) {
        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }

      request.metadataCacheMissStartedAt = performance.now();
      request.metadataCacheMissOperationName = operationName;
    },
    onResponse: async ({ response, serverContext }) => {
      const request = (
        serverContext as unknown as { req: ObservedMetadataRequest }
      ).req;
      const operationName = getOperationName(serverContext);

      if (!request.workspace?.id) {
        return;
      }

      if (!config.operationsToCache.includes(operationName)) {
        return;
      }

      const cacheKey = computeCacheKey({
        operationName,
        request,
      });

      const cachedResponse = await config.cacheGetter(cacheKey);
      const responseBody = await response.clone().json();

      if (!cachedResponse && !responseBody.errors) {
        await config.cacheSetter(cacheKey, responseBody);
      }

      if (
        isDefined(request.metadataCacheMissStartedAt) &&
        request.metadataCacheMissOperationName === operationName
      ) {
        warnIfSlowDuration({
          logger,
          message: 'Slow metadata cache miss',
          thresholdMs: SLOW_METADATA_CACHE_MISS_MS,
          durationMs: performance.now() - request.metadataCacheMissStartedAt,
          context: {
            operation: operationName,
            workspaceId: request.workspace.id,
            userScoped: USER_SCOPED_METADATA_OPERATIONS.has(operationName),
            hadErrors: Boolean(responseBody.errors),
          },
        });
      }

      delete request.metadataCacheMissStartedAt;
      delete request.metadataCacheMissOperationName;
    },
  };
}
