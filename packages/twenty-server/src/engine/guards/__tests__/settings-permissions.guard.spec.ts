import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

describe('SettingsPermissionsGuard', () => {
  let guard: any;
  let mockPermissionsService: jest.Mocked<PermissionsService>;
  let mockExecutionContext: ExecutionContext;
  let mockGqlContext: any;

  beforeEach(() => {
    mockPermissionsService = {
      userHasWorkspaceSettingPermission: jest.fn(),
    } as any;

    mockGqlContext = {
      req: {
        workspace: {
          id: 'workspace-id',
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        userWorkspaceId: 'user-workspace-id',
        apiKey: null,
      },
    };

    mockExecutionContext = {} as ExecutionContext;

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue({ getContext: () => mockGqlContext } as any);

    const GuardClass = SettingsPermissionsGuard(PermissionFlagType.WORKSPACE);

    guard = new GuardClass(mockPermissionsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should bypass permission check when workspace is being created', async () => {
      mockGqlContext.req.workspace.activationStatus =
        WorkspaceActivationStatus.PENDING_CREATION;

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).not.toHaveBeenCalled();
    });

    it('should return true when user has required permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        true,
      );

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(
        mockPermissionsService.userHasWorkspaceSettingPermission,
      ).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        setting: PermissionFlagType.WORKSPACE,
        workspaceId: 'workspace-id',
        apiKeyId: undefined,
      });
    });

    it('should throw PermissionsException when user lacks permission', async () => {
      mockPermissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
        false,
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        PermissionsException,
      );
    });
  });
});
