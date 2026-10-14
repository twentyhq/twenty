import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';

import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

describe('AppConnectionAccessService', () => {
  let service: AppConnectionAccessService;
  let userHasWorkspaceSettingPermission: jest.Mock;

  beforeEach(async () => {
    userHasWorkspaceSettingPermission = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConnectionAccessService,
        {
          provide: PermissionsService,
          useValue: { userHasWorkspaceSettingPermission },
        },
      ],
    }).compile();

    service = module.get(AppConnectionAccessService);
  });

  describe('validateCallerCanManageConnection', () => {
    it('should allow a user connection when the member can connect accounts', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(true);

      await expect(
        service.validateCallerCanManageConnection({
          isWorkspaceShared: false,
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
        }),
      ).resolves.toBeUndefined();

      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith({
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
        setting: PermissionFlagType.CONNECTED_ACCOUNTS,
        apiKeyId: undefined,
        applicationId: undefined,
      });
    });

    it('should reject a user connection when the member cannot connect accounts', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(false);

      const validation = service.validateCallerCanManageConnection({
        isWorkspaceShared: false,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      });

      await expect(validation).rejects.toBeInstanceOf(PermissionsException);
      await expect(validation).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          setting: PermissionFlagType.CONNECTED_ACCOUNTS,
        }),
      );
    });

    it('should reject a workspace connection when the member cannot manage applications', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(false);

      const validation = service.validateCallerCanManageConnection({
        isWorkspaceShared: true,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      });

      await expect(validation).rejects.toBeInstanceOf(PermissionsException);
      await expect(validation).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          setting: PermissionFlagType.APPLICATIONS,
        }),
      );
    });

    it('should allow a workspace connection when the member can manage applications', async () => {
      userHasWorkspaceSettingPermission.mockResolvedValue(true);

      await expect(
        service.validateCallerCanManageConnection({
          isWorkspaceShared: true,
          workspaceId: WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_ID,
        }),
      ).resolves.toBeUndefined();

      expect(userHasWorkspaceSettingPermission).toHaveBeenCalledWith({
        userWorkspaceId: USER_WORKSPACE_ID,
        workspaceId: WORKSPACE_ID,
        setting: PermissionFlagType.APPLICATIONS,
        apiKeyId: undefined,
        applicationId: undefined,
      });
    });
  });
});
