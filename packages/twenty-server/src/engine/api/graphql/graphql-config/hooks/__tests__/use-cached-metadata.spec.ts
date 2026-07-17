import { createHash } from 'crypto';

import { type Request } from 'express';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';

describe('useCachedMetadata', () => {
  const query = 'query FindAllViews { views { id } }';
  const queryHash = createHash('sha256').update(query).digest('hex');

  const createRequest = (operationName = 'FindAllViews') =>
    ({
      body: { operationName, query },
      locale: 'en',
      userWorkspaceId: 'user-workspace-id',
      workspace: { id: 'workspace-id', metadataVersion: 3 },
    }) as Request;

  it('includes the view cache version in FindAllViews cache keys', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const plugin = useCachedMetadata({
      cacheGetter,
      cacheSetter: jest.fn(),
      findAllViewsCacheVersionGetter: jest
        .fn()
        .mockResolvedValue('view-version'),
      operationsToCache: ['FindAllViews'],
    });
    const request = createRequest();

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: request },
    } as never);

    expect(cacheGetter).toHaveBeenCalledWith(
      `graphql:operations:FindAllViews:workspace-id:3:view-version:user-workspace-id:${queryHash}`,
    );
  });

  it('reuses the request version when caching the response', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const cacheSetter = jest.fn();
    const findAllViewsCacheVersionGetter = jest
      .fn()
      .mockResolvedValueOnce('view-version-1')
      .mockResolvedValueOnce('view-version-2');
    const plugin = useCachedMetadata({
      cacheGetter,
      cacheSetter,
      findAllViewsCacheVersionGetter,
      operationsToCache: ['FindAllViews'],
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

    expect(findAllViewsCacheVersionGetter).toHaveBeenCalledTimes(1);
    expect(cacheSetter).toHaveBeenCalledWith(
      `graphql:operations:FindAllViews:workspace-id:3:view-version-1:user-workspace-id:${queryHash}`,
      { data: { views: [] } },
    );
  });

  it('does not load a view version for other metadata operations', async () => {
    const cacheGetter = jest.fn().mockResolvedValue(undefined);
    const findAllViewsCacheVersionGetter = jest.fn();
    const plugin = useCachedMetadata({
      cacheGetter,
      cacheSetter: jest.fn(),
      findAllViewsCacheVersionGetter,
      operationsToCache: ['ObjectMetadataItems'],
    });
    const request = createRequest('ObjectMetadataItems');

    await plugin.onRequest?.({
      endResponse: jest.fn(),
      serverContext: { req: request },
    } as never);

    expect(findAllViewsCacheVersionGetter).not.toHaveBeenCalled();
    expect(cacheGetter).toHaveBeenCalledWith(
      `graphql:operations:ObjectMetadataItems:workspace-id:3:en:${queryHash}`,
    );
  });
});
