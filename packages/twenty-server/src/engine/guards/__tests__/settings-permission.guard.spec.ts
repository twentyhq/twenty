import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from 'twenty-shared/constants';

import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

describe('SettingsPermissionGuard', () => {
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

    const GuardClass = SettingsPermissionGuard(PermissionFlagType.WORKSPACE);

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

  describe('canActivate with an application-only token', () => {
    let mockApplicationRepository: { findOne: jest.Mock };
    let mockRoleRepository: { findOne: jest.Mock };

    beforeEach(() => {
      mockApplicationRepository = { findOne: jest.fn() };
      mockRoleRepository = { findOne: jest.fn() };

      mockGqlContext.req.userWorkspaceId = undefined;
      mockGqlContext.req.application = { id: 'application-id' };

      const permissionsService = new PermissionsService(
        {} as any,
        {} as any,
        {} as any,
        mockRoleRepository as any,
        mockApplicationRepository as any,
      );

      const GuardClass = SettingsPermissionGuard(PermissionFlagType.LAYOUTS);

      guard = new GuardClass(permissionsService);
    });

    it('should deny with PERMISSION_DENIED when the application has no default role', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 'application-id',
        defaultRoleId: null,
      });

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
      expect(mockRoleRepository.findOne).not.toHaveBeenCalled();
    });

    it('should allow when the default role of the application grants the setting', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 'application-id',
        defaultRoleId: 'role-id',
      });
      mockRoleRepository.findOne.mockResolvedValue({
        id: 'role-id',
        canUpdateAllSettings: true,
        rolePermissionFlags: [],
      });

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith('workspace-id', {
        where: { id: 'role-id' },
        relations: [
          'rolePermissionFlags',
          'rolePermissionFlags.permissionFlag',
        ],
      });
    });

    it('should deny with PERMISSION_DENIED when the default role of the application lacks the setting', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 'application-id',
        defaultRoleId: 'role-id',
      });
      mockRoleRepository.findOne.mockResolvedValue({
        id: 'role-id',
        canUpdateAllSettings: false,
        rolePermissionFlags: [],
      });

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
    });

    it('should reject with NO_AUTHENTICATION_CONTEXT when the application does not exist', async () => {
      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      });
    });
  });
});
