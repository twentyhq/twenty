import { createHash } from 'crypto';

import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { parse, print } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import {
  type CachedOperationConfig,
  useCachedMetadata,
} from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { getActiveWorkspaceCachePins } from 'src/engine/workspace-cache/storage/workspace-cache-request-pins.storage';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  getCurrentScope: jest.fn(),
  setTags: jest.fn(),
  startSpan: jest.fn(),
}));

const APPROVED_QUERY =
  'query FindAllViews($viewTypes: [ViewType!]) { getViews(viewTypes: $viewTypes) { id } }';
const APPROVED_VARIABLES = { viewTypes: ['TABLE', 'KANBAN'] };

const fingerprintOf = (query: string) =>
  createHash('sha256')
    .update(print(parse(query)))
    .digest('hex');

const ACCESS_POLICY = {} as AccessPolicy;

const DEPENDENCY_HASHES = {
  combinedHash: 'dependency-hash',
  sourceHashes: { flatViewMaps: 'view-generation-1' },
};

describe('useCachedMetadata', () => {
  const mockScope = {
    setTransactionName: jest.fn(),
  };
  const mockSpan = {
    setAttribute: jest.fn(),
  };

  const expectedSpanOptions = (phase: 'request' | 'response') => ({
    name: 'metadata GraphQL cache lookup',
    op: 'cache.get',
    onlyIfParent: true,
    attributes: {
      'cache.phase': phase,
      'graphql.operation.name': 'FindAllViews',
      'graphql.operation.type': 'query',
    },
  });

  const createRequest = (overrides: Record<string, unknown> = {}) =>
    ({
      body: {
        operationName: 'FindAllViews',
        query: APPROVED_QUERY,
        variables: APPROVED_VARIABLES,
      },
      locale: 'en',
      tokenType: JwtTokenTypeEnum.ACCESS,
      user: { id: 'user-id' },
      userWorkspaceId: 'user-workspace-id',
      workspaceMemberId: 'workspace-member-id',
      workspace: { id: 'workspace-id' },
      ...overrides,
    }) as unknown as Request;

  const createPlugin = ({
    cacheGetter = jest.fn().mockResolvedValue(undefined),
    cacheSetter = jest.fn(),
    dependencyHashesGetter = jest.fn().mockResolvedValue(DEPENDENCY_HASHES),
    assertAccessPolicySatisfied = jest.fn().mockResolvedValue(undefined),
    assertCacheAdmission = jest.fn().mockResolvedValue(undefined),
    scope = 'userWorkspace',
    admissionDependencies = ['flatRoleTargetMaps'],
  }: {
    cacheGetter?: jest.Mock;
    cacheSetter?: jest.Mock;
    dependencyHashesGetter?: jest.Mock;
    assertAccessPolicySatisfied?: jest.Mock;
    assertCacheAdmission?: jest.Mock;
    scope?: CachedOperationConfig['scope'];
    admissionDependencies?: CachedOperationConfig['admissionDependencies'];
  } = {}) =>
    useCachedMetadata({
      cacheGetter,
      cacheSetter,
      operationsToCache: {
        FindAllViews: {
          scope,
          dependencies: ['flatViewMaps'],
          accessPolicy: ACCESS_POLICY,
          isAllowedWhenWorkspaceSuspended: true,
          approvedRequests: [
            {
              documentFingerprint: fingerprintOf(APPROVED_QUERY),
              variables: APPROVED_VARIABLES,
            },
          ],
          admissionDependencies,
        },
      },
      dependencyHashesGetter,
      assertAccessPolicySatisfied,
      assertCacheAdmission,
    });

  const runRequest = async ({
    plugin,
    request,
    responseBody = { data: { getViews: [] } },
    execute = () => undefined,
  }: {
    plugin: ReturnType<typeof createPlugin>;
    request: Request;
    responseBody?: unknown;
    execute?: () => void;
  }) => {
    const serverContext = { req: request };
    const endResponse = jest.fn();

    await plugin.onRequest?.({ endResponse, serverContext } as never);

    if (endResponse.mock.calls.length === 0) {
      let executeFn: (executeArgs: unknown) => unknown = () => execute();

      void plugin.onExecute?.({
        args: { contextValue: serverContext },
        executeFn,
        setExecuteFn: (wrappedExecuteFn: typeof executeFn) => {
          executeFn = wrappedExecuteFn;
        },
      } as never);

      await executeFn({});
    }

    const response =
      endResponse.mock.calls[0]?.[0] ?? Response.json(responseBody);

    await plugin.onResponse?.({ response, serverContext } as never);

    return { endResponse, response: response as Response };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Sentry.getCurrentScope).mockReturnValue(mockScope as never);
    jest
      .mocked(Sentry.startSpan)
      .mockImplementation((_options, callback) => callback(mockSpan as never));
  });

  it('reads the cache once when returning a cached response', async () => {
    const cachedResponse = { data: { getViews: [{ id: 'view-id' }] } };
    const cacheGetter = jest.fn().mockResolvedValue(cachedResponse);
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });

    const { response } = await runRequest({
      plugin,
      request: createRequest(),
    });

    expect(cacheGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(await response.json()).toEqual(cachedResponse);
    expect(Sentry.setTags).toHaveBeenCalledWith({
      operationName: 'FindAllViews',
      operation: 'query',
    });
    expect(mockScope.setTransactionName).toHaveBeenCalledWith('FindAllViews');
    expect(Sentry.startSpan).toHaveBeenCalledTimes(1);
    expect(Sentry.startSpan).toHaveBeenCalledWith(
      expectedSpanOptions('request'),
      expect.any(Function),
    );
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('cache.hit', true);
  });

  it('preserves a value populated after the request cache miss', async () => {
    const cacheGetter = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ data: { getViews: [{ id: 'view-id' }] } });
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });

    await runRequest({ plugin, request: createRequest() });

    expect(cacheGetter).toHaveBeenCalledTimes(2);
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(mockSpan.setAttribute).toHaveBeenNthCalledWith(
      1,
      'cache.hit',
      false,
    );
    expect(mockSpan.setAttribute).toHaveBeenNthCalledWith(2, 'cache.hit', true);
  });

  it('stores the response under a versioned key built from the document fingerprint', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetter = jest.fn();
    const dependencyHashesGetter = jest
      .fn()
      .mockResolvedValue(DEPENDENCY_HASHES);
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashesGetter,
    });
    const responseBody = { data: { getViews: [] } };

    await runRequest({ plugin, request: createRequest(), responseBody });

    expect(dependencyHashesGetter).toHaveBeenCalledTimes(1);
    expect(dependencyHashesGetter).toHaveBeenCalledWith('workspace-id', [
      'flatViewMaps',
    ]);

    const cacheKey = cacheGetter.mock.calls[0][0];

    expect(cacheKey).toMatch(/^graphql:operations:v2:FindAllViews:/);
    expect(cacheKey).toContain('dependency-hash');
    expect(cacheKey).toContain('user-workspace-id');
    expect(cacheKey).toContain(fingerprintOf(APPROVED_QUERY));
    expect(cacheSetter).toHaveBeenCalledWith(cacheKey, responseBody);
  });

  it('runs execution inside a request pin scope', async () => {
    const plugin = createPlugin();
    let hasPinScopeDuringExecution = false;

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        hasPinScopeDuringExecution = isDefined(
          getActiveWorkspaceCachePins('workspace-id'),
        );
      },
    });

    expect(hasPinScopeDuringExecution).toBe(true);
    expect(getActiveWorkspaceCachePins('workspace-id')).toBeUndefined();
  });

  it('stores the response when the consumed generation matches the key', async () => {
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheSetter });

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        getActiveWorkspaceCachePins('workspace-id')?.set('flatViewMaps', {
          data: {} as never,
          hash: 'view-generation-1',
        });
      },
    });

    expect(cacheSetter).toHaveBeenCalledTimes(1);
  });

  it('never stores a response built from a generation other than the key', async () => {
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheSetter });

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        getActiveWorkspaceCachePins('workspace-id')?.set('flatViewMaps', {
          data: {} as never,
          hash: 'view-generation-0',
        });
      },
    });

    expect(cacheSetter).not.toHaveBeenCalled();
  });

  it('never stores a response that consumed an undeclared dependency', async () => {
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheSetter });

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        const workspacePins = getActiveWorkspaceCachePins('workspace-id');

        workspacePins?.set('flatViewMaps', {
          data: {} as never,
          hash: 'view-generation-1',
        });
        workspacePins?.set('flatViewFieldMaps', {
          data: {} as never,
          hash: 'undeclared-generation',
        });
      },
    });

    expect(cacheSetter).not.toHaveBeenCalled();
  });

  it('opens no pin scope for operations outside the response cache', async () => {
    const plugin = createPlugin();
    let hasPinScopeDuringExecution = true;

    await runRequest({
      plugin,
      request: createRequest({
        body: {
          operationName: 'DeleteView',
          query: 'mutation DeleteView { deleteView(id: "view-id") }',
        },
      }),
      execute: () => {
        hasPinScopeDuringExecution = isDefined(
          getActiveWorkspaceCachePins('workspace-id'),
        );
      },
    });

    expect(hasPinScopeDuringExecution).toBe(false);
  });

  it('never serves a cached body when cache admission refuses the caller', async () => {
    const cacheGetter = jest
      .fn()
      .mockResolvedValue({ data: { getViews: [{ id: 'view-id' }] } });
    const assertCacheAdmission = jest
      .fn()
      .mockRejectedValue(new Error('role removed'));
    const plugin = createPlugin({ cacheGetter, assertCacheAdmission });

    const { endResponse } = await runRequest({
      plugin,
      request: createRequest(),
    });

    expect(assertCacheAdmission).toHaveBeenCalledWith({
      operationName: 'FindAllViews',
      request: expect.anything(),
    });
    expect(endResponse).not.toHaveBeenCalled();
    expect(cacheGetter).not.toHaveBeenCalled();
  });

  it('serves the same cached body again once the caller is re-admitted', async () => {
    const storedBodies = new Map<string, unknown>();
    const cacheGetter = jest.fn(async (key: string) => storedBodies.get(key));
    const cacheSetter = jest.fn(async (key: string, value: unknown) => {
      storedBodies.set(key, value);
    });
    const assertCacheAdmission = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('role removed'))
      .mockResolvedValueOnce(undefined);
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      assertCacheAdmission,
    });
    const responseBody = { data: { getViews: [{ id: 'view-id' }] } };

    await runRequest({ plugin, request: createRequest(), responseBody });
    const refused = await runRequest({ plugin, request: createRequest() });
    const readmitted = await runRequest({ plugin, request: createRequest() });

    expect(cacheSetter).toHaveBeenCalledTimes(1);
    expect(refused.endResponse).not.toHaveBeenCalled();
    expect(readmitted.endResponse).toHaveBeenCalledTimes(1);
    expect(await readmitted.response.json()).toEqual(responseBody);
  });

  it('skips cache admission for operations without admission dependencies', async () => {
    const assertCacheAdmission = jest.fn();
    const cacheSetter = jest.fn();
    const plugin = createPlugin({
      assertCacheAdmission,
      cacheSetter,
      admissionDependencies: [],
    });

    await runRequest({ plugin, request: createRequest() });

    expect(assertCacheAdmission).not.toHaveBeenCalled();
    expect(cacheSetter).toHaveBeenCalledTimes(1);
  });

  it('stores a response that consumed a listed admission dependency', async () => {
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheSetter });

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        getActiveWorkspaceCachePins('workspace-id')?.set('flatRoleTargetMaps', {
          data: {} as never,
          hash: 'role-generation',
        });
      },
    });

    expect(cacheSetter).toHaveBeenCalledTimes(1);
  });

  it('never lets an admission listing mask a payload dependency mismatch', async () => {
    const cacheSetter = jest.fn();
    const plugin = createPlugin({
      cacheSetter,
      admissionDependencies: ['flatViewMaps'],
    });

    await runRequest({
      plugin,
      request: createRequest(),
      execute: () => {
        getActiveWorkspaceCachePins('workspace-id')?.set('flatViewMaps', {
          data: {} as never,
          hash: 'view-generation-0',
        });
      },
    });

    expect(cacheSetter).not.toHaveBeenCalled();
  });

  it('shares cache entries across users for workspace-scoped operations', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = createPlugin({ cacheGetter, scope: 'workspace' });

    await runRequest({ plugin, request: createRequest() });

    const cacheKey = cacheGetter.mock.calls[0][0];

    expect(cacheKey).not.toContain('user-workspace-id');
    expect(cacheKey).toContain(':en:');
  });

  it('accepts the approved document whatever its whitespace', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });

    await runRequest({
      plugin,
      request: createRequest({
        body: {
          operationName: 'FindAllViews',
          query: `\n${APPROVED_QUERY.replace(/ /g, '  ')}\n`,
          variables: { viewTypes: ['TABLE', 'KANBAN'] },
        },
      }),
    });

    expect(cacheSetter).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      title: 'a different selection under an approved operation name',
      body: {
        operationName: 'FindAllViews',
        query:
          'query FindAllViews($viewTypes: [ViewType!]) { getViews(viewTypes: $viewTypes) { id name } }',
        variables: APPROVED_VARIABLES,
      },
    },
    {
      title: 'a mutation named like an approved query',
      body: {
        operationName: 'FindAllViews',
        query: 'mutation FindAllViews { deleteView(id: "view-id") }',
      },
    },
    {
      title: 'unapproved variables',
      body: {
        operationName: 'FindAllViews',
        query: APPROVED_QUERY,
        variables: { viewTypes: ['TABLE'] },
      },
    },
    {
      title: 'extra variables',
      body: {
        operationName: 'FindAllViews',
        query: APPROVED_QUERY,
        variables: { ...APPROVED_VARIABLES, unused: true },
      },
    },
    {
      title: 'a second operation in the document',
      body: {
        operationName: 'FindAllViews',
        query: `${APPROVED_QUERY} query Other { getViews { id } }`,
        variables: APPROVED_VARIABLES,
      },
    },
    {
      title: 'an unparsable document',
      body: { operationName: 'FindAllViews', query: 'query FindAllViews {' },
    },
  ])('runs uncached for $title', async ({ body }) => {
    const cacheGetter = jest.fn();
    const cacheSetter = jest.fn();
    const dependencyHashesGetter = jest.fn();
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashesGetter,
    });

    const { endResponse } = await runRequest({
      plugin,
      request: createRequest({ body }),
    });

    expect(endResponse).not.toHaveBeenCalled();
    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(dependencyHashesGetter).not.toHaveBeenCalled();
  });

  it.each([
    {
      title: 'an API key',
      overrides: {
        tokenType: JwtTokenTypeEnum.API_KEY,
        apiKey: { id: 'api-key-id' },
        user: undefined,
        userWorkspaceId: undefined,
        workspaceMemberId: undefined,
      },
    },
    {
      title: 'a member acting through an application',
      overrides: {
        tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
        application: { id: 'application-id', sourceType: 'LOCAL' },
      },
    },
    {
      title: 'a member session running an agent',
      overrides: { agentId: 'agent-id' },
    },
    {
      title: 'a user pending activation',
      overrides: { workspaceMemberId: undefined },
    },
  ])('runs uncached for $title', async ({ overrides }) => {
    const cacheGetter = jest.fn();
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });

    await runRequest({ plugin, request: createRequest(overrides) });

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
  });

  it('never serves a cached body when the access policy refuses the caller', async () => {
    const cacheGetter = jest
      .fn()
      .mockResolvedValue({ data: { getViews: [{ id: 'view-id' }] } });
    const assertAccessPolicySatisfied = jest
      .fn()
      .mockRejectedValue(new Error('refused'));
    const plugin = createPlugin({ cacheGetter, assertAccessPolicySatisfied });

    const { endResponse } = await runRequest({
      plugin,
      request: createRequest(),
    });

    expect(endResponse).not.toHaveBeenCalled();
    expect(cacheGetter).not.toHaveBeenCalled();
  });

  it('serves the request uncached when dependency hashes cannot be resolved', async () => {
    const cacheGetter = jest.fn();
    const cacheSetter = jest.fn();
    const dependencyHashesGetter = jest
      .fn()
      .mockRejectedValue(new Error('cache storage unavailable'));
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashesGetter,
    });

    await runRequest({ plugin, request: createRequest() });

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('does not trace client-controlled operations outside the cache allowlist', async () => {
    const cacheGetter = jest.fn();
    const plugin = createPlugin({ cacheGetter });

    await runRequest({
      plugin,
      request: createRequest({
        body: {
          operationName: 'UncachedOperation',
          query: 'query UncachedOperation { getViews { id } }',
        },
      }),
    });

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(Sentry.setTags).not.toHaveBeenCalled();
    expect(Sentry.startSpan).not.toHaveBeenCalled();
  });

  it('ignores operation names inherited from Object.prototype', async () => {
    const cacheGetter = jest.fn();
    const dependencyHashesGetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, dependencyHashesGetter });

    await runRequest({
      plugin,
      request: createRequest({
        body: {
          operationName: 'constructor',
          query: 'query { getViews { id } }',
        },
      }),
    });

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(dependencyHashesGetter).not.toHaveBeenCalled();
  });
});
