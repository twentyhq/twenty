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
import {
  createWorkspaceCacheRequestPins,
  getPinnedWorkspaceCacheHashes,
  runWithWorkspaceCacheRequestPins,
  type WorkspaceCacheRequestPins,
} from 'src/engine/workspace-cache/storage/workspace-cache-request-pins.storage';
import {
  type WorkspaceCacheKeyName,
  type WorkspaceCacheOrDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const RESPONSE_CACHE_NAMESPACE = 'graphql:operations:v2';

export type CachedOperationConfig = {
  dependencies: WorkspaceCacheOrDerivedCacheKeyName[];
  scope: 'workspace' | 'userWorkspace';
  accessPolicy: AccessPolicy;
  isAllowedWhenWorkspaceSuspended: boolean;
  approvedRequests: MetadataResponseCacheApprovedRequest[];
};

type DependencyHashes = {
  combinedHash: string;
  sourceHashes: Partial<Record<WorkspaceCacheKeyName, string>>;
};

type RequestCacheEntry = {
  cacheKey: string;
  sourceHashes: Partial<Record<WorkspaceCacheKeyName, string>>;
};

const areConsumedHashesDeclaredAndMatching = ({
  consumedHashes,
  declaredHashes,
}: {
  consumedHashes: Partial<Record<string, string>>;
  declaredHashes: Partial<Record<string, string>>;
}): boolean =>
  Object.entries(consumedHashes).every(
    ([cacheKeyName, consumedHash]) =>
      isDefined(declaredHashes[cacheKeyName]) &&
      declaredHashes[cacheKeyName] === consumedHash,
  );

export type CacheMetadataPluginConfig = {
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheGetter: (key: string) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  cacheSetter: (key: string, value: any) => Promise<void>;
  operationsToCache: Record<string, CachedOperationConfig>;
  dependencyHashesGetter: (
    workspaceId: string,
    cacheKeyNames: WorkspaceCacheOrDerivedCacheKeyName[],
  ) => Promise<DependencyHashes>;
  assertAccessPolicySatisfied: (args: {
    accessPolicy: AccessPolicy;
    request: Request;
  }) => Promise<void>;
};

export function useCachedMetadata(
  config: CacheMetadataPluginConfig,
): Plugin<{ req?: Request }, { req: Request }> {
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
  }): Promise<RequestCacheEntry> => {
    const { combinedHash, sourceHashes } = await config.dependencyHashesGetter(
      workspaceId,
      operationConfig.dependencies,
    );
    const userScopeSegment =
      operationConfig.scope === 'userWorkspace'
        ? `:${request.userWorkspaceId}`
        : '';

    return {
      cacheKey: `${RESPONSE_CACHE_NAMESPACE}:${operationName}:${workspaceId}:${combinedHash}${userScopeSegment}:${request.locale}:${approvedRequest.documentFingerprint}:${approvedRequest.variablesFingerprint}`,
      sourceHashes,
    };
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
  const requestCacheEntries = new WeakMap<Request, RequestCacheEntry>();
  const requestPins = new WeakMap<Request, WorkspaceCacheRequestPins>();

  const getOrCreateRequestPins = (
    request: Request,
  ): WorkspaceCacheRequestPins => {
    const existingRequestPins = requestPins.get(request);

    if (isDefined(existingRequestPins)) {
      return existingRequestPins;
    }

    const createdRequestPins = createWorkspaceCacheRequestPins();

    requestPins.set(request, createdRequestPins);

    return createdRequestPins;
  };

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
  }): Promise<RequestCacheEntry | undefined> => {
    try {
      const requestCacheEntry = await computeCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
        approvedRequest,
      });

      requestCacheEntries.set(request, requestCacheEntry);

      return requestCacheEntry;
    } catch (error) {
      Sentry.captureException(error);

      return undefined;
    }
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

      const requestCacheEntry = await resolveCacheKey({
        operationName,
        operationConfig,
        workspaceId,
        request,
        approvedRequest,
      });

      if (!isDefined(requestCacheEntry)) {
        return;
      }

      const cachedResponse = await getCachedResponse({
        cacheKey: requestCacheEntry.cacheKey,
        operationName,
        phase: 'request',
      });

      if (cachedResponse) {
        cacheHitRequests.add(request);

        const earlyResponse = Response.json(cachedResponse);

        return endResponse(earlyResponse);
      }
    },
    onExecute: ({ args, executeFn, setExecuteFn }) => {
      const request = args.contextValue.req;

      if (!isDefined(request) || !requestCacheEntries.has(request)) {
        return;
      }

      const pins = getOrCreateRequestPins(request);

      setExecuteFn((executeArgs) =>
        runWithWorkspaceCacheRequestPins(pins, () => executeFn(executeArgs)),
      );
    },
    onResponse: async ({ response, serverContext }) => {
      const request = serverContext.req;
      const workspaceId = request.workspace?.id;

      if (!isDefined(workspaceId)) {
        return;
      }

      const operationName = getOperationName(serverContext);

      if (!isDefined(getOperationCacheConfig(operationName))) {
        return;
      }

      if (cacheHitRequests.delete(request)) {
        return;
      }

      const requestCacheEntry = requestCacheEntries.get(request);

      if (!isDefined(requestCacheEntry)) {
        return;
      }

      const pins = requestPins.get(request);
      const pinnedHashes = isDefined(pins)
        ? getPinnedWorkspaceCacheHashes(pins, workspaceId)
        : {};

      if (
        !areConsumedHashesDeclaredAndMatching({
          consumedHashes: pinnedHashes,
          declaredHashes: requestCacheEntry.sourceHashes,
        })
      ) {
        return;
      }

      const { cacheKey } = requestCacheEntry;

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

        await config.cacheSetter(cacheKey, responseBody);
      }
    },
  };
}
