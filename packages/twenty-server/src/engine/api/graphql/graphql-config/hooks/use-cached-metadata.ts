import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { type Plugin } from 'graphql-yoga';
import { type MetadataResponseCacheApprovedRequest } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  type ApprovedMetadataCacheRequest,
  findApprovedMetadataCacheRequest,
} from 'src/engine/api/graphql/graphql-config/utils/find-approved-metadata-cache-request.util';
import { isPlainWorkspaceMemberRequest } from 'src/engine/api/graphql/graphql-config/utils/is-plain-workspace-member-request.util';
import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type WorkspaceCacheOrDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const RESPONSE_CACHE_NAMESPACE = 'graphql:operations:v2';

export type CachedOperationConfig = {
  dependencies: WorkspaceCacheOrDerivedCacheKeyName[];
  scope: 'workspace' | 'userWorkspace';
  accessPolicy: AccessPolicy;
  isAllowedWhenWorkspaceSuspended: boolean;
  approvedRequests: MetadataResponseCacheApprovedRequest[];
};

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheSetter: (key: string, value: any) => void;
  operationsToCache: Record<string, CachedOperationConfig>;
  dependencyHashGetter: (
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheOrDerivedCacheKeyName[],
  ) => Promise<string>;
  assertAccessPolicySatisfied: (args: {
    accessPolicy: AccessPolicy;
    request: Request;
  }) => Promise<void>;
};

export function useCachedMetadata(
  config: CacheMetadataPluginConfig,
): Plugin<object, { req: Request }> {
  const computeCacheKey = async ({
    operationName,
    operationConfig,
    workspaceId,
    request,
    approvedRequest,
  }: {
    operationName: string;
    operationConfig: CachedOperationConfig;
    workspaceId: string;
    request: Pick<Request, 'locale' | 'userWorkspaceId'>;
    approvedRequest: ApprovedMetadataCacheRequest;
  }): Promise<string> => {
    const dependencyHash = await config.dependencyHashGetter(
      workspaceId,
      operationConfig.dependencies,
    );
    const userScopeSegment =
      operationConfig.scope === 'userWorkspace'
        ? `:${request.userWorkspaceId}`
        : '';

    return `${RESPONSE_CACHE_NAMESPACE}:${operationName}:${workspaceId}:${dependencyHash}${userScopeSegment}:${request.locale}:${approvedRequest.documentFingerprint}:${approvedRequest.variablesFingerprint}`;
  };

  const resolveEligibleApprovedRequest = async ({
    operationName,
    operationConfig,
    request,
  }: {
    operationName: string;
    operationConfig: CachedOperationConfig;
    request: Request;
  }): Promise<ApprovedMetadataCacheRequest | undefined> => {
    if (!isPlainWorkspaceMemberRequest(request)) {
      return undefined;
    }

    if (
      !operationConfig.isAllowedWhenWorkspaceSuspended &&
      isWorkspaceSuspended(request.workspace)
    ) {
      return undefined;
    }

    const approvedRequest = findApprovedMetadataCacheRequest({
      operationName,
      query: request.body?.query,
      variables: request.body?.variables,
      approvedRequests: operationConfig.approvedRequests,
    });

    if (!isDefined(approvedRequest)) {
      return undefined;
    }

    try {
      await config.assertAccessPolicySatisfied({
        accessPolicy: operationConfig.accessPolicy,
        request,
      });
    } catch {
      return undefined;
    }

    return approvedRequest;
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
    approvedRequest,
  }: {
    operationName: string;
    operationConfig: CachedOperationConfig;
    workspaceId: string;
    request: Request;
    approvedRequest: ApprovedMetadataCacheRequest;
  }): Promise<string | null> => {
    let cacheKey: string | null;

    try {
      cacheKey = await computeCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
        approvedRequest,
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
      const request = serverContext.req;
      const workspaceId = request.workspace?.id;

      if (!workspaceId) {
        return;
      }

      const operationName = getOperationName(serverContext);
      const operationConfig = getOperationCacheConfig(operationName);

      if (!isDefined(operationConfig)) {
        return;
      }

      const approvedRequest = await resolveEligibleApprovedRequest({
        operationName,
        operationConfig,
        request,
      });

      if (!isDefined(approvedRequest)) {
        return;
      }

      Sentry.setTags({ operationName, operation: 'query' });
      Sentry.getCurrentScope().setTransactionName(operationName);

      const cacheKey = await resolveCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
        approvedRequest,
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
      const request = serverContext.req;

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
