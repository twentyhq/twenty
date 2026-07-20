import * as Sentry from '@sentry/node';
import { type Request } from 'express';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

jest.mock('@sentry/node', () => ({
  getCurrentScope: jest.fn(),
  setTags: jest.fn(),
  startSpan: jest.fn(),
}));

describe('useCachedMetadata', () => {
  const cacheTtlMilliseconds = 60_000;
  const mockScope = {
    setTransactionName: jest.fn(),
  };
  const mockSpan = {
    setAttribute: jest.fn(),
  };

  const expectedSpanOptions = {
    name: 'metadata GraphQL cache lookup',
    op: 'cache.get',
    onlyIfParent: true,
    attributes: {
      'cache.phase': 'request',
      'graphql.operation.name': 'FindAllViews',
      'graphql.operation.type': 'query',
    },
  };

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
      workspace: { id: 'workspace-id', metadataVersion: 3 },
      ...overrides,
    }) as Request;

  const createPlugin = ({
    cacheGetter = jest.fn().mockResolvedValue(undefined),
    cacheSetterIfAbsent = jest.fn().mockResolvedValue(true),
    cacheGenerationGetter = jest.fn().mockResolvedValue('generation-1'),
  } = {}) =>
    useCachedMetadata({
      cacheGetter,
      cacheSetterIfAbsent,
      operationConfigs: {
        FindAllViews: {
          cacheGenerationGetter,
          cacheTtlMilliseconds,
          variesByLocale: true,
          variesByUserWorkspace: true,
        },
      },
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
    const cacheSetterIfAbsent = jest.fn();
    const plugin = createPlugin({ cacheGetter, cacheSetterIfAbsent });
    const request = createRequest();
    const serverContext = { req: request };
    const endResponse = jest.fn();

    await plugin.onRequest?.({ endResponse, serverContext } as never);

    const response = endResponse.mock.calls[0][0] as Response;

    await plugin.onResponse?.({ response, serverContext } as never);

    expect(cacheGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetterIfAbsent).not.toHaveBeenCalled();
    expect(await response.json()).toEqual(cachedResponse);
    expect(Sentry.setTags).toHaveBeenCalledWith({
      operationName: 'FindAllViews',
      operation: 'query',
    });
    expect(mockScope.setTransactionName).toHaveBeenCalledWith('FindAllViews');
    expect(Sentry.startSpan).toHaveBeenCalledTimes(1);
    expect(Sentry.startSpan).toHaveBeenCalledWith(
      expectedSpanOptions,
      expect.any(Function),
    );
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('cache.hit', true);
  });

  it('atomically fills the cache after a request cache miss', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetterIfAbsent = jest.fn().mockResolvedValue(false);
    const plugin = createPlugin({ cacheGetter, cacheSetterIfAbsent });
    const request = createRequest();
    const serverContext = { req: request };
    const response = Response.json({ data: { views: [] } });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({ response, serverContext } as never);

    expect(cacheGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetterIfAbsent).toHaveBeenCalledTimes(1);
    expect(cacheSetterIfAbsent).toHaveBeenCalledWith(
      cacheGetter.mock.calls[0][0],
      { data: { views: [] } },
      cacheTtlMilliseconds,
    );
    expect(Sentry.startSpan).toHaveBeenCalledTimes(1);
    expect(Sentry.startSpan).toHaveBeenCalledWith(
      expectedSpanOptions,
      expect.any(Function),
    );
    expect(mockSpan.setAttribute).toHaveBeenCalledWith('cache.hit', false);
  });

  it('keeps the request cache generation when the generation changes during execution', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetterIfAbsent = jest.fn().mockResolvedValue(true);
    const cacheGenerationGetter = jest
      .fn()
      .mockResolvedValueOnce('generation-1')
      .mockResolvedValueOnce('generation-2');
    const plugin = createPlugin({
      cacheGetter,
      cacheSetterIfAbsent,
      cacheGenerationGetter,
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

    expect(cacheGenerationGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetterIfAbsent).toHaveBeenCalledWith(
      cacheGetter.mock.calls[0][0],
      { data: { views: [] } },
      cacheTtlMilliseconds,
    );
  });

  it('bypasses response caching when no generation is available', async () => {
    const cacheGetter = jest.fn();
    const cacheSetterIfAbsent = jest.fn();
    const cacheGenerationGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = createPlugin({
      cacheGetter,
      cacheSetterIfAbsent,
      cacheGenerationGetter,
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

    expect(cacheGenerationGetter).toHaveBeenCalledTimes(1);
    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetterIfAbsent).not.toHaveBeenCalled();
  });

  it('isolates cache entries by generation', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheGenerationGetter = jest
      .fn()
      .mockResolvedValueOnce('generation-1')
      .mockResolvedValueOnce('generation-2');
    const plugin = createPlugin({ cacheGetter, cacheGenerationGetter });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: createRequest() },
    } as never);
    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: createRequest() },
    } as never);

    expect(cacheGetter.mock.calls[0][0]).not.toBe(cacheGetter.mock.calls[1][0]);
  });

  it('isolates cache entries by locale', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = createPlugin({ cacheGetter });
    const firstRequest = createRequest({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews($viewTypes: [ViewType!]) { views { id } }',
        variables: { viewTypes: ['TABLE'] },
      },
      locale: 'en',
    });
    const secondRequest = createRequest({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews($viewTypes: [ViewType!]) { views { id } }',
        variables: { viewTypes: ['TABLE'] },
      },
      locale: 'fr-FR',
    });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: firstRequest },
    } as never);
    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: secondRequest },
    } as never);

    expect(cacheGetter.mock.calls[0][0]).not.toBe(cacheGetter.mock.calls[1][0]);
  });

  it('isolates cache entries by variables', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = createPlugin({ cacheGetter });
    const tableRequest = createRequest({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews($viewTypes: [ViewType!]) { views { id } }',
        variables: { viewTypes: ['TABLE'] },
      },
    });
    const kanbanRequest = createRequest({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews($viewTypes: [ViewType!]) { views { id } }',
        variables: { viewTypes: ['KANBAN'] },
      },
    });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: tableRequest },
    } as never);
    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: kanbanRequest },
    } as never);

    expect(cacheGetter.mock.calls[0][0]).not.toBe(cacheGetter.mock.calls[1][0]);
  });

  it('isolates cache entries by user workspace', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = createPlugin({ cacheGetter });

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: {
        req: createRequest({ userWorkspaceId: 'first-user-workspace-id' }),
      },
    } as never);
    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: {
        req: createRequest({ userWorkspaceId: 'second-user-workspace-id' }),
      },
    } as never);

    expect(cacheGetter.mock.calls[0][0]).not.toBe(cacheGetter.mock.calls[1][0]);
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
});
