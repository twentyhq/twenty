import { PermissionFlagType } from 'twenty-shared/constants';

import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

const WORKSPACE_ID = 'workspace-id';

const buildService = ({ hasPermission }: { hasPermission: boolean }) => {
  const workspaceRepository = {
    findOneBy: jest.fn().mockResolvedValue({
      id: WORKSPACE_ID,
      activationStatus: 'ACTIVE',
    }),
    update: jest.fn().mockResolvedValue(undefined),
    findOneByOrFail: jest.fn().mockResolvedValue({ id: WORKSPACE_ID }),
  };
  const permissionsService = {
    userHasWorkspaceSettingPermission: jest
      .fn()
      .mockResolvedValue(hasPermission),
  };
  // only the collaborators on the update path are stubbed
  const service = Object.assign(
    new (WorkspaceService as unknown as new (
      ...dependencies: unknown[]
    ) => WorkspaceService)(),
    {
      workspaceRepository,
      permissionsService,
      coreEntityCacheService: { invalidate: jest.fn() },
      twentyConfigService: { get: jest.fn() },
    },
  );

  return { service, workspaceRepository, permissionsService };
};

const update = (
  service: WorkspaceService,
  defaultSenderDomain: string | null,
) =>
  service.updateWorkspaceById({
    payload: { id: WORKSPACE_ID, defaultSenderDomain },
    userWorkspaceId: 'user-workspace-id',
    apiKey: undefined,
  });

describe('WorkspaceService.updateWorkspaceById defaultSenderDomain', () => {
  it('stores a normalized domain', async () => {
    const { service, workspaceRepository } = buildService({
      hasPermission: true,
    });

    await update(service, ' @GetIndexed.AI ');

    expect(workspaceRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ defaultSenderDomain: 'getindexed.ai' }),
    );
  });

  it('stores null for an empty string', async () => {
    const { service, workspaceRepository } = buildService({
      hasPermission: true,
    });

    await update(service, '');

    expect(workspaceRepository.update).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({ defaultSenderDomain: null }),
    );
  });

  it('requires the WORKSPACE permission flag', async () => {
    const { service, workspaceRepository, permissionsService } = buildService({
      hasPermission: false,
    });

    await expect(update(service, 'getindexed.ai')).rejects.toBeInstanceOf(
      PermissionsException,
    );
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ setting: PermissionFlagType.WORKSPACE }),
    );
    expect(workspaceRepository.update).not.toHaveBeenCalled();
  });
});
