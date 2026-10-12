import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    let mockWorkspaceCacheService: { getOrRecompute: jest.Mock };

    const mockCache = ({
      defaultRoleId,
      canUpdateAllSettings = false,
      isLayoutsFlagAssigned = false,
    }: {
      defaultRoleId: string | null;
      canUpdateAllSettings?: boolean;
      isLayoutsFlagAssigned?: boolean;
    }) =>
      mockWorkspaceCacheService.getOrRecompute.mockResolvedValue({
        userWorkspaceRoleMap: {},
        flatApplicationMaps: {
          byId: {
            'application-id': {
              id: 'application-id',
              defaultRoleId,
              deletedAt: null,
            },
          },
          idByUniversalIdentifier: {},
        },
        flatRoleMaps: {
          byUniversalIdentifier: {
            'role-universal-identifier': {
              id: 'role-id',
              canUpdateAllSettings,
              canAccessAllTools: false,
              rolePermissionFlagIds: isLayoutsFlagAssigned
                ? ['role-permission-flag-id']
                : [],
            },
          },
          universalIdentifierById: { 'role-id': 'role-universal-identifier' },
        },
        flatRolePermissionFlagMaps: {
          byUniversalIdentifier: {
            'role-permission-flag-universal-identifier': {
              id: 'role-permission-flag-id',
              permissionFlagUniversalIdentifier:
                SystemPermissionFlag[PermissionFlagType.LAYOUTS],
            },
          },
          universalIdentifierById: {
            'role-permission-flag-id':
              'role-permission-flag-universal-identifier',
          },
        },
      });

    beforeEach(async () => {
      mockWorkspaceCacheService = { getOrRecompute: jest.fn() };

      mockGqlContext.req.userWorkspaceId = undefined;
      mockGqlContext.req.application = { id: 'application-id' };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PermissionsService,
          { provide: ApiKeyRoleService, useValue: {} },
          {
            provide: WorkspaceCacheService,
            useValue: mockWorkspaceCacheService,
          },
        ],
      }).compile();

      const permissionsService = module.get(PermissionsService);

      const GuardClass = SettingsPermissionGuard(PermissionFlagType.LAYOUTS);

      guard = new GuardClass(permissionsService);
    });

    it('should deny with PERMISSION_DENIED when the application has no default role', async () => {
      mockCache({ defaultRoleId: null });

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
    });

    it('should allow when the default role of the application grants the setting', async () => {
      mockCache({ defaultRoleId: 'role-id', canUpdateAllSettings: true });

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
      expect(mockWorkspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
      expect(mockWorkspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
        'workspace-id',
        [
          'userWorkspaceRoleMap',
          'flatApplicationMaps',
          'flatRoleMaps',
          'flatRolePermissionFlagMaps',
        ],
      );
    });

    it('should allow when the setting is assigned to the default role of the application', async () => {
      mockCache({
        defaultRoleId: 'role-id',
        canUpdateAllSettings: false,
        isLayoutsFlagAssigned: true,
      });

      await expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
    });

    it('should deny with PERMISSION_DENIED when the default role of the application lacks the setting', async () => {
      mockCache({ defaultRoleId: 'role-id', canUpdateAllSettings: false });

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.PERMISSION_DENIED,
      });
    });

    it('should reject with NO_AUTHENTICATION_CONTEXT when the application does not exist', async () => {
      mockCache({ defaultRoleId: 'role-id', canUpdateAllSettings: true });
      mockGqlContext.req.application = { id: 'unknown-application-id' };

      await expect(
        guard.canActivate(mockExecutionContext),
      ).rejects.toMatchObject({
        code: PermissionsExceptionCode.NO_AUTHENTICATION_CONTEXT,
      });
    });
  });
});
