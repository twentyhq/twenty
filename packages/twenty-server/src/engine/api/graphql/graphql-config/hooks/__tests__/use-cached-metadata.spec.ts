import * as Sentry from '@sentry/node';
import { type Request } from 'express';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  getCurrentScope: jest.fn(),
  setTags: jest.fn(),
  startSpan: jest.fn(),
}));

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

  const createRequest = (
    overrides: Partial<
      Pick<Request, 'body' | 'locale' | 'userWorkspaceId' | 'workspace'>
    > = {},
  ) =>
    ({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews { views { id } }',
      },
      locale: 'en',
      userWorkspaceId: 'user-workspace-id',
      workspace: { id: 'workspace-id' },
      ...overrides,
    }) as Request;

  const createPlugin = ({
    cacheGetter = jest.fn().mockResolvedValue(undefined),
    cacheSetter = jest.fn(),
    dependencyHashGetter = jest.fn().mockResolvedValue('dependency-hash'),
  } = {}) =>
    useCachedMetadata({
      cacheGetter,
      cacheSetter,
      operationsToCache: {
        FindAllViews: {
          scope: 'userWorkspace',
          dependencies: ['flatViewMaps'],
        },
      },
      dependencyHashGetter,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Sentry.getCurrentScope).mockReturnValue(mockScope as never);
    jest
      .mocked(Sentry.startSpan)
      .mockImplementation((_options, callback) => callback(mockSpan as never));
  });

  it('reads the cache once when returning a cached response', async () => {
    const cachedResponse = { data: { views: [{ id: 'view-id' }] } };
    const cacheGetter = jest.fn().mockResolvedValue(cachedResponse);
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });
    const request = createRequest();
    const serverContext = { req: request };
    const endResponse = jest.fn();

    await plugin.onRequest?.({ endResponse, serverContext } as never);

    const response = endResponse.mock.calls[0][0] as Response;

    await plugin.onResponse?.({ response, serverContext } as never);

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
    const responseCachedByAnotherRequest = {
      data: { views: [{ id: 'view-id' }] },
    };
    const cacheGetter = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(responseCachedByAnotherRequest);
    const cacheSetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetter });
    const request = createRequest();
    const serverContext = { req: request };
    const response = Response.json({ data: { views: [] } });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({ response, serverContext } as never);

    expect(cacheGetter).toHaveBeenCalledTimes(2);
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(Sentry.startSpan).toHaveBeenNthCalledWith(
      1,
      expectedSpanOptions('request'),
      expect.any(Function),
    );
    expect(Sentry.startSpan).toHaveBeenNthCalledWith(
      2,
      expectedSpanOptions('response'),
      expect.any(Function),
    );
    expect(mockSpan.setAttribute).toHaveBeenNthCalledWith(
      1,
      'cache.hit',
      false,
    );
    expect(mockSpan.setAttribute).toHaveBeenNthCalledWith(2, 'cache.hit', true);
  });

  it('resolves dependency hashes once per request and caches the response under that key', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetter = jest.fn();
    const dependencyHashGetter = jest.fn().mockResolvedValue('dependency-hash');
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyHashGetter,
    });
    const request = createRequest();
    const serverContext = { req: request };
    const responseBody = { data: { views: [] } };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({
      response: Response.json(responseBody),
      serverContext,
    } as never);

    expect(dependencyHashGetter).toHaveBeenCalledTimes(1);
    expect(dependencyHashGetter).toHaveBeenCalledWith('workspace-id', [
      'flatViewMaps',
    ]);

    const cacheKey = cacheGetter.mock.calls[0][0];

    expect(cacheKey).toContain('dependency-hash');
    expect(cacheKey).toContain('user-workspace-id');
    expect(cacheSetter).toHaveBeenCalledWith(cacheKey, responseBody);
  });

  it('shares cache entries across users for workspace-scoped operations', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = useCachedMetadata({
      cacheGetter,
      cacheSetter: jest.fn(),
      operationsToCache: {
        FindAllViews: { scope: 'workspace', dependencies: ['flatViewMaps'] },
      },
      dependencyHashGetter: jest.fn().mockResolvedValue('dependency-hash'),
    });
    const request = createRequest();
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);

    const cacheKey = cacheGetter.mock.calls[0][0];

    expect(cacheKey).not.toContain('user-workspace-id');
    expect(cacheKey).toContain(':en:');
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
    const request = createRequest();
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({
      response: Response.json({ data: { views: [] } }),
      serverContext,
    } as never);

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('does not trace client-controlled operations outside the cache allowlist', async () => {
    const cacheGetter = jest.fn();
    const plugin = createPlugin({ cacheGetter });
    const request = createRequest({
      body: {
        operationName: 'UncachedOperation',
        query: 'query UncachedOperation { views { id } }',
      },
    });
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({
      response: Response.json({ data: {} }),
      serverContext,
    } as never);

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(Sentry.setTags).not.toHaveBeenCalled();
    expect(Sentry.startSpan).not.toHaveBeenCalled();
  });

  it('ignores operation names inherited from Object.prototype', async () => {
    const cacheGetter = jest.fn();
    const dependencyHashGetter = jest.fn();
    const plugin = createPlugin({ cacheGetter, dependencyHashGetter });
    const request = createRequest({
      body: {
        operationName: 'constructor',
        query: 'query { views { id } }',
      },
    });
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(dependencyHashGetter).not.toHaveBeenCalled();
  });
});
