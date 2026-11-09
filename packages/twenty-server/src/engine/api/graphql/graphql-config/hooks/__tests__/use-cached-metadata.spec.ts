import { createHash } from 'crypto';

import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { parse, print } from 'graphql';

import {
  type CachedOperationConfig,
  useCachedMetadata,
} from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

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
    dependencyHashGetter = jest.fn().mockResolvedValue('dependency-hash'),
    assertAccessPolicySatisfied = jest.fn().mockResolvedValue(undefined),
    scope = 'userWorkspace',
  }: {
    cacheGetter?: jest.Mock;
    cacheSetter?: jest.Mock;
    dependencyHashGetter?: jest.Mock;
    assertAccessPolicySatisfied?: jest.Mock;
    scope?: CachedOperationConfig['scope'];
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
        },
      },
      dependencyHashGetter,
      assertAccessPolicySatisfied,
    });

  const runRequest = async ({
    plugin,
    request,
    responseBody = { data: { getViews: [] } },
  }: {
    plugin: ReturnType<typeof createPlugin>;
    request: Request;
    responseBody?: unknown;
  }) => {
    const serverContext = { req: request };
    const endResponse = jest.fn();

    await plugin.onRequest?.({ endResponse, serverContext } as never);

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
    const dependencyHashGetter = jest.fn().mockResolvedValue('dependency-hash');
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashGetter,
    });
    const responseBody = { data: { getViews: [] } };

    await runRequest({ plugin, request: createRequest(), responseBody });

    expect(dependencyHashGetter).toHaveBeenCalledTimes(1);
    expect(dependencyHashGetter).toHaveBeenCalledWith('workspace-id', [
      'flatViewMaps',
    ]);

    const cacheKey = cacheGetter.mock.calls[0][0];

    expect(cacheKey).toMatch(/^graphql:operations:v2:FindAllViews:/);
    expect(cacheKey).toContain('dependency-hash');
    expect(cacheKey).toContain('user-workspace-id');
    expect(cacheKey).toContain(fingerprintOf(APPROVED_QUERY));
    expect(cacheSetter).toHaveBeenCalledWith(cacheKey, responseBody);
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
    const dependencyHashGetter = jest.fn();
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashGetter,
    });

    const { endResponse } = await runRequest({
      plugin,
      request: createRequest({ body }),
    });

    expect(endResponse).not.toHaveBeenCalled();
    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(dependencyHashGetter).not.toHaveBeenCalled();
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
    const dependencyHashGetter = jest
      .fn()
      .mockRejectedValue(new Error('cache storage unavailable'));
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashGetter,
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
    const dependencyHashGetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, dependencyHashGetter });

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
    expect(dependencyHashGetter).not.toHaveBeenCalled();
  });
});
