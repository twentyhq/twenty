import { createHash } from 'crypto';

import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type CacheMetadataOperationConfig = {
  cacheGenerationGetter?: (workspaceId: string) => Promise<string | undefined>;
  cacheTtlMilliseconds?: number;
  variesByLocale?: boolean;
  variesByUserWorkspace?: boolean;
};

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  cacheSetterIfAbsent: (
    key: string,
    value: unknown,
    ttlMilliseconds?: number,
  ) => Promise<boolean>;
  operationConfigs: Record<string, CacheMetadataOperationConfig>;
  cacheKeySalt?: string;
};

export function useCachedMetadata(config: CacheMetadataPluginConfig): Plugin {
  const computeCacheKey = async ({
    operationName,
    operationConfig,
    request,
  }: {
    operationName: string;
    operationConfig: CacheMetadataOperationConfig;
    request: Pick<Request, 'workspace' | 'locale' | 'body' | 'userWorkspaceId'>;
  }): Promise<string | undefined> => {
    const workspace = request.workspace;

    if (!isDefined(workspace)) {
      throw new InternalServerError('Workspace is not defined');
    }

    const cacheGeneration = await operationConfig.cacheGenerationGetter?.(
      workspace.id,
    );

    if (
      isDefined(operationConfig.cacheGenerationGetter) &&
      !isDefined(cacheGeneration)
    ) {
      return undefined;
    }

    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          cacheGeneration,
          cacheKeySalt: config.cacheKeySalt,
          locale: operationConfig.variesByLocale
            ? (request.locale ?? null)
            : undefined,
          query: request.body.query,
          userWorkspaceId: operationConfig.variesByUserWorkspace
            ? (request.userWorkspaceId ?? null)
            : undefined,
          variables: request.body.variables ?? null,
        }),
      )
      .digest('hex');
    const workspaceMetadataVersion = workspace.metadataVersion ?? '0';

    return `graphql:operations:${operationName}:${workspace.id}:${workspaceMetadataVersion}:${requestHash}`;
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  const getOperationName = (serverContext: any) =>
    serverContext?.req?.body?.operationName;

  const cacheHitRequests = new WeakSet<Request>();
  const cacheKeyByRequest = new WeakMap<Request, Promise<string | undefined>>();

  const getCacheKey = ({
    operationName,
    operationConfig,
    request,
  }: {
    operationName: string;
    operationConfig: CacheMetadataOperationConfig;
    request: Request;
  }): Promise<string | undefined> => {
    const existingCacheKey = cacheKeyByRequest.get(request);

    if (isDefined(existingCacheKey)) {
      return existingCacheKey;
    }

    const cacheKey = computeCacheKey({
      operationName,
      operationConfig,
      request,
    });

    cacheKeyByRequest.set(request, cacheKey);

    return cacheKey;
  };

  const getCachedResponse = ({
    cacheKey,
    operationName,
  }: {
    cacheKey: string;
    operationName: string;
  }) =>
    Sentry.startSpan(
      {
        name: 'metadata GraphQL cache lookup',
        op: 'cache.get',
        onlyIfParent: true,
        attributes: {
          'cache.phase': 'request',
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
      const request = (serverContext as unknown as { req: Request }).req;

      if (!request.workspace?.id) {
        return;
      }

      const operationName = getOperationName(serverContext);
      const operationConfig = config.operationConfigs[operationName];

      if (!isDefined(operationConfig)) {
        return;
      }

      Sentry.setTags({ operationName, operation: 'query' });
      Sentry.getCurrentScope().setTransactionName(operationName);

      const cacheKey = await getCacheKey({
        operationName,
        operationConfig,
        request,
      });

      if (!isDefined(cacheKey)) {
        return;
      }

      const cachedResponse = await getCachedResponse({
        cacheKey,
        operationName,
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
      const operationConfig = config.operationConfigs[operationName];

      if (!isDefined(operationConfig)) {
        return;
      }

      if (cacheHitRequests.delete(request)) {
        return;
      }

      const cacheKey = await getCacheKey({
        operationName,
        operationConfig,
        request,
      });

      if (!isDefined(cacheKey)) {
        return;
      }

      const responseBody = await response.json();

      if (responseBody.errors) {
        return;
      }

      await config.cacheSetterIfAbsent(
        cacheKey,
        responseBody,
        operationConfig.cacheTtlMilliseconds,
      );
    },
  };
}
