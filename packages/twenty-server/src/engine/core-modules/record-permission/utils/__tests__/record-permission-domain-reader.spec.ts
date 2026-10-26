import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { getRecordPermissionReadAuthContext } from 'src/engine/core-modules/record-permission/utils/get-record-permission-read-auth-context.util';
import { getRecordPermissionReadRepository } from 'src/engine/core-modules/record-permission/utils/get-record-permission-read-repository.util';
import { findLiveReadableRecordIdentifiers } from 'src/engine/core-modules/record-permission/utils/find-live-readable-record-identifiers.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock('src/engine/twenty-orm/storage/orm-workspace-context.storage');

describe('Permission-aware domain readers', () => {
  const authContext = {
    type: 'user',
    workspace: { id: 'workspace' },
  } as WorkspaceAuthContext;
  const findAllowed = jest.fn();
  const repository = {
    findRecordIdsAllowedForRecordPermissionAction: findAllowed,
  };
  const manager = {
    getRepositoryWithContextPermissions: jest.fn(() => repository),
    getRepository: jest.fn(() => repository),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getWorkspaceContext).mockReturnValue({
      authContext,
      recordPermissionContext: {},
    } as ReturnType<typeof getWorkspaceContext>);
  });
  it('retains the authenticated caller and rejects cross-workspace reads', () => {
    workspaceAuthContextStorage.run(authContext, () => {
      expect(getRecordPermissionReadAuthContext('workspace')).toBe(authContext);
      expect(() => getRecordPermissionReadAuthContext('other')).toThrow(
        'does not match',
      );
    });
  });
  it('uses caller permissions once a policy is active', () => {
    getRecordPermissionReadRepository(
      manager as unknown as WorkspaceOrmManager,
      'calendarEvent',
    );
    expect(manager.getRepositoryWithContextPermissions).toHaveBeenCalledWith(
      'calendarEvent',
    );
    expect(manager.getRepository).not.toHaveBeenCalled();
  });
  it('keeps the previous domain reader before policy activation', () => {
    jest
      .mocked(getWorkspaceContext)
      .mockReturnValue({ authContext } as ReturnType<
        typeof getWorkspaceContext
      >);
    getRecordPermissionReadRepository(
      manager as unknown as WorkspaceOrmManager,
      'calendarEvent',
    );
    expect(manager.getRepository).toHaveBeenCalledWith('calendarEvent', {
      shouldBypassPermissionChecks: true,
    });
  });
  it('checks new file-link recipients live in bounded batches and excludes revoked records', async () => {
    const identifiers = Array.from({ length: 401 }, (_, index) =>
      String(index),
    );
    findAllowed.mockImplementation(
      async ({ recordIds }: { recordIds: string[] }) =>
        recordIds.filter((id) => id !== '200'),
    );
    const allowed = await findLiveReadableRecordIdentifiers({
      workspaceOrmManager: manager as unknown as WorkspaceOrmManager,
      objectNameSingular: 'person',
      recordIds: identifiers,
    });
    expect(allowed?.size).toBe(400);
    expect(allowed?.has('200')).toBe(false);
    expect(
      findAllowed.mock.calls.map(([args]) => args.recordIds.length),
    ).toEqual([200, 200, 1]);
  });

  it('rejects timeline traversal from a revoked root before resolving related records', async () => {
    findAllowed.mockResolvedValue([]);
    const cache = { getOrRecompute: jest.fn() };
    const service = new RelatedPersonIdsService(
      {
        ...manager,
        executeInWorkspaceContext: async (callback: () => Promise<unknown>) =>
          callback(),
      } as unknown as WorkspaceOrmManager,
      cache as unknown as WorkspaceCacheService,
    );
    await expect(
      service.getRelatedPersonIds({
        workspaceId: 'workspace',
        objectNameSingular: 'company',
        recordId: 'revoked',
      }),
    ).rejects.toThrow('Record is not accessible');
    expect(cache.getOrRecompute).not.toHaveBeenCalled();
  });

  it('checks a person root live before returning its identifier', async () => {
    findAllowed.mockResolvedValue(['allowed']);
    const service = new RelatedPersonIdsService(
      {
        ...manager,
        executeInWorkspaceContext: async (callback: () => Promise<unknown>) =>
          callback(),
      } as unknown as WorkspaceOrmManager,
      {} as WorkspaceCacheService,
    );
    await expect(
      service.getRelatedPersonIds({
        workspaceId: 'workspace',
        objectNameSingular: 'person',
        recordId: 'allowed',
      }),
    ).resolves.toEqual(['allowed']);
    expect(findAllowed).toHaveBeenCalledWith({
      recordIds: ['allowed'],
      action: 'read',
    });
  });
});
