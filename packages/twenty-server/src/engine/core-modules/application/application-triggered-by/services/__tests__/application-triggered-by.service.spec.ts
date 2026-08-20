import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ApplicationTriggeredByService } from 'src/engine/core-modules/application/application-triggered-by/services/application-triggered-by.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-1';
const TRIGGERED_BY = {
  userId: 'user-1',
  userWorkspaceId: 'user-workspace-1',
};

describe('ApplicationTriggeredByService', () => {
  let service: ApplicationTriggeredByService;
  let getUserWorkspacePermissions: jest.Mock;
  let getOrRecompute: jest.Mock;

  beforeEach(async () => {
    getUserWorkspacePermissions = jest.fn().mockResolvedValue({
      permissionFlags: {
        [PermissionFlagType.WORKSPACE_MEMBERS]: true,
        [PermissionFlagType.ROLES]: false,
        [PermissionFlagType.DATA_MODEL]: true,
      },
      objectsPermissions: {},
    });

    getOrRecompute = jest.fn().mockResolvedValue({
      flatWorkspaceMemberMaps: {
        idByUserId: { 'user-1': 'workspace-member-1' },
        byId: { 'workspace-member-1': { id: 'workspace-member-1' } },
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTriggeredByService,
        {
          provide: PermissionsService,
          useValue: { getUserWorkspacePermissions },
        },
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
      ],
    }).compile();

    service = module.get(ApplicationTriggeredByService);
  });

  it('should describe the triggering person with only their granted flags', async () => {
    expect(
      await service.describe({
        triggeredBy: TRIGGERED_BY,
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({
      userId: 'user-1',
      userWorkspaceId: 'user-workspace-1',
      workspaceMemberId: 'workspace-member-1',
      permissionFlags: [
        PermissionFlagType.WORKSPACE_MEMBERS,
        PermissionFlagType.DATA_MODEL,
      ],
    });
  });

  it('should not name a workspace member the person no longer has', async () => {
    getOrRecompute.mockResolvedValue({
      flatWorkspaceMemberMaps: { idByUserId: {}, byId: {} },
    });

    const triggeredBy = await service.describe({
      triggeredBy: TRIGGERED_BY,
      workspaceId: WORKSPACE_ID,
    });

    expect(triggeredBy.workspaceMemberId).toBeNull();
  });

  it('should not name a soft deleted workspace member', async () => {
    getOrRecompute.mockResolvedValue({
      flatWorkspaceMemberMaps: {
        idByUserId: { 'user-1': 'workspace-member-1' },
        byId: {
          'workspace-member-1': {
            id: 'workspace-member-1',
            deletedAt: new Date(),
          },
        },
      },
    });

    const triggeredBy = await service.describe({
      triggeredBy: TRIGGERED_BY,
      workspaceId: WORKSPACE_ID,
    });

    expect(triggeredBy.workspaceMemberId).toBeNull();
  });

  it('should grant nothing to a person who lost every role', async () => {
    getUserWorkspacePermissions.mockRejectedValue(
      new PermissionsException(
        PermissionsExceptionMessage.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      ),
    );

    const triggeredBy = await service.describe({
      triggeredBy: TRIGGERED_BY,
      workspaceId: WORKSPACE_ID,
    });

    expect(triggeredBy.permissionFlags).toEqual([]);
    expect(triggeredBy.userId).toBe('user-1');
  });

  it('should surface any other permission failure', async () => {
    getUserWorkspacePermissions.mockRejectedValue(
      new PermissionsException(
        PermissionsExceptionMessage.USER_WORKSPACE_NOT_FOUND,
        PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
      ),
    );

    await expect(
      service.describe({
        triggeredBy: TRIGGERED_BY,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toThrow(PermissionsException);
  });
});
