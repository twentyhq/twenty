import { type Request } from 'express';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

describe('useCachedMetadata', () => {
  const createRequest = (
    overrides: Partial<
      Pick<Request, 'body' | 'locale' | 'userWorkspaceId' | 'workspace'>
    > = {},
  ) =>
    ({
      body: {
        operationName: 'FindAllViews',
        query: 'query FindAllViews { views { id } }',
        variables: { objectMetadataId: 'object-id' },
      },
      locale: 'en',
      userWorkspaceId: 'user-workspace-id',
      workspace: { id: 'workspace-id', metadataVersion: 3 },
      ...overrides,
    }) as Request;

  const createPlugin = ({
    cacheGetter = jest.fn().mockResolvedValue(undefined),
    cacheSetter = jest.fn(),
    dependencyVersionGetter = jest.fn().mockResolvedValue('dependencies-1'),
  } = {}) =>
    useCachedMetadata({
      cacheGetter,
      cacheSetter,
      dependencyVersionGetters: {
        FindAllViews: dependencyVersionGetter,
      },
      operationsToCache: ['FindAllViews'],
    });

  const runOnRequest = async ({
    plugin,
    request,
    endResponse = jest.fn(),
  }: {
    plugin: ReturnType<typeof createPlugin>;
    request: Request;
    endResponse?: jest.Mock;
  }) => {
    await plugin.onRequest?.({
      endResponse,
      serverContext: { req: request },
    } as never);
  };

  it('returns a cached response for the same dependencies and request identity', async () => {
    const cachedResponse = { data: { views: [{ id: 'view-id' }] } };
    const cacheGetter = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(cachedResponse);
    const endResponse = jest.fn();
    const plugin = createPlugin({ cacheGetter });

    await runOnRequest({ plugin, request: createRequest() });
    await runOnRequest({ plugin, request: createRequest(), endResponse });

    expect(cacheGetter.mock.calls[0][0]).toBe(cacheGetter.mock.calls[1][0]);
    expect(endResponse).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200 }),
    );
  });

  it('uses different keys when the dependency version changes', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const dependencyVersionGetter = jest
      .fn()
      .mockResolvedValueOnce('dependencies-1')
      .mockResolvedValueOnce('dependencies-2');
    const plugin = createPlugin({ cacheGetter, dependencyVersionGetter });

    await runOnRequest({ plugin, request: createRequest() });
    await runOnRequest({ plugin, request: createRequest() });

    expect(cacheGetter.mock.calls[0][0]).not.toBe(cacheGetter.mock.calls[1][0]);
  });

  it.each([
    ['user workspace', { userWorkspaceId: 'other-user-workspace-id' }],
    ['locale', { locale: 'fr' }],
    [
      'variables',
      {
        body: {
          operationName: 'FindAllViews',
          query: 'query FindAllViews { views { id } }',
          variables: { objectMetadataId: 'other-object-id' },
        },
      },
    ],
    [
      'query',
      {
        body: {
          operationName: 'FindAllViews',
          query: 'query FindAllViews { views { name } }',
          variables: { objectMetadataId: 'object-id' },
        },
      },
    ],
    [
      'metadata version',
      { workspace: { id: 'workspace-id', metadataVersion: 4 } },
    ],
  ] as const)(
    'does not collide when %s changes',
    async (_identityPart, requestOverrides) => {
      const cacheGetter = jest.fn().mockResolvedValue(undefined);
      const plugin = createPlugin({ cacheGetter });

      await runOnRequest({ plugin, request: createRequest() });
      await runOnRequest({
        plugin,
        request: createRequest(requestOverrides as never),
      });

      expect(cacheGetter.mock.calls[0][0]).not.toBe(
        cacheGetter.mock.calls[1][0],
      );
    },
  );

  it('reuses the dependency version resolved at request start', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetter = jest.fn();
    const dependencyVersionGetter = jest
      .fn()
      .mockResolvedValueOnce('dependencies-1')
      .mockResolvedValueOnce('dependencies-2');
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyVersionGetter,
    });
    const request = createRequest();
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({
      response: { json: jest.fn().mockResolvedValue({ data: { views: [] } }) },
      serverContext,
    } as never);

    expect(dependencyVersionGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetter.mock.calls[0][0]).toContain(':dependencies-1:');
    expect(cacheSetter.mock.calls[0][0]).not.toContain(':dependencies-2:');
  });

  it('bypasses caching when dependency hashes remain unavailable', async () => {
    const cacheGetter = jest.fn();
    const cacheSetter = jest.fn();
    const plugin = createPlugin({
      cacheGetter,
      cacheSetter,
      dependencyVersionGetter: jest.fn().mockResolvedValue(undefined),
    });
    const request = createRequest();
    const serverContext = { req: request };

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext,
    } as never);
    await plugin.onResponse?.({
      response: { json: jest.fn() },
      serverContext,
    } as never);

    expect(cacheGetter).not.toHaveBeenCalled();
    expect(cacheSetter).not.toHaveBeenCalled();
  });
});
