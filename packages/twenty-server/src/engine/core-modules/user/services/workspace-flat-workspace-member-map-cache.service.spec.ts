import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { WorkspaceFlatWorkspaceMemberMapCacheService } from 'src/engine/core-modules/user/services/workspace-flat-workspace-member-map-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

describe('WorkspaceFlatWorkspaceMemberMapCacheService', () => {
  const workspaceId = '202ddf9e-17ce-4277-93c4-851f732af9ca';

  const getService = () => {
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(),
      getRepository: jest.fn(),
    } as unknown as jest.Mocked<GlobalWorkspaceOrmManager>;

    const service = new WorkspaceFlatWorkspaceMemberMapCacheService(
      globalWorkspaceOrmManager,
    );

    return { service, globalWorkspaceOrmManager };
  };

  it('should return an empty map when workspaceMember metadata is missing', async () => {
    const { service, globalWorkspaceOrmManager } = getService();

    globalWorkspaceOrmManager.getRepository.mockRejectedValue(
      new EntityMetadataNotFoundError('workspaceMember'),
    );
    globalWorkspaceOrmManager.executeInWorkspaceContext.mockImplementation(
      async (callback) => callback(),
    );

    const result = await service.computeForCache(workspaceId);

    expect(result).toEqual({ byId: {}, idByUserId: {} });
  });

  it('should rethrow errors that are not metadata related', async () => {
    const { service, globalWorkspaceOrmManager } = getService();

    globalWorkspaceOrmManager.getRepository.mockRejectedValue(
      new Error('unexpected failure'),
    );
    globalWorkspaceOrmManager.executeInWorkspaceContext.mockImplementation(
      async (callback) => callback(),
    );

    await expect(service.computeForCache(workspaceId)).rejects.toThrow(
      'unexpected failure',
    );
  });
});
