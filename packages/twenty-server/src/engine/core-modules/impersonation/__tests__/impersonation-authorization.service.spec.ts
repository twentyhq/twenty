import { Test, type TestingModule } from '@nestjs/testing';

import { PermissionFlagType } from 'twenty-shared/constants';

import { ImpersonationAuthorizationService } from 'src/engine/core-modules/impersonation/services/impersonation-authorization.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const userHasWorkspaceSettingPermissionMock = jest.fn();
const twentyConfigServiceGetMock = jest.fn();

const VERIFIED_TWO_FACTOR_METHODS = [
  { status: OTPStatus.VERIFIED },
] as unknown as UserWorkspaceEntity['twoFactorAuthenticationMethods'];

type BuildUserWorkspaceParams = {
  userWorkspaceId?: string;
  userId?: string;
  workspaceId?: string;
  canImpersonate?: boolean;
  canAccessFullAdminPanel?: boolean;
  allowImpersonation?: boolean;
  twoFactorAuthenticationMethods?: UserWorkspaceEntity['twoFactorAuthenticationMethods'];
};

const buildUserWorkspace = ({
  userWorkspaceId = 'user-workspace-id',
  userId = 'user-id',
  workspaceId = 'workspace-id',
  canImpersonate = false,
  canAccessFullAdminPanel = false,
  allowImpersonation = false,
  twoFactorAuthenticationMethods = [],
}: BuildUserWorkspaceParams): UserWorkspaceEntity =>
  ({
    id: userWorkspaceId,
    userId,
    user: {
      id: userId,
      canImpersonate,
      canAccessFullAdminPanel,
    },
    workspace: {
      id: workspaceId,
      allowImpersonation,
    },
    twoFactorAuthenticationMethods,
  }) as unknown as UserWorkspaceEntity;

describe('ImpersonationAuthorizationService', () => {
  let service: ImpersonationAuthorizationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    twentyConfigServiceGetMock.mockImplementation((key: string) =>
      key === 'NODE_ENV' ? NodeEnvironment.PRODUCTION : undefined,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImpersonationAuthorizationService,
        {
          provide: PermissionsService,
          useValue: {
            userHasWorkspaceSettingPermission:
              userHasWorkspaceSettingPermissionMock,
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: twentyConfigServiceGetMock,
          },
        },
      ],
    }).compile();

    service = module.get<ImpersonationAuthorizationService>(
      ImpersonationAuthorizationService,
    );
  });

  describe('getImpersonationLevel', () => {
    it('should return workspace when impersonator and target share a workspace', () => {
      const impersonator = buildUserWorkspace({ workspaceId: 'workspace-1' });
      const target = buildUserWorkspace({
        userId: 'other',
        workspaceId: 'workspace-1',
      });

      expect(service.getImpersonationLevel(impersonator, target)).toBe(
        'workspace',
      );
    });

    it('should return server when impersonator and target are in different workspaces', () => {
      const impersonator = buildUserWorkspace({ workspaceId: 'workspace-1' });
      const target = buildUserWorkspace({
        userId: 'other',
        workspaceId: 'workspace-2',
      });

      expect(service.getImpersonationLevel(impersonator, target)).toBe(
        'server',
      );
    });
  });

  describe('server-level impersonation', () => {
    it('should allow when impersonator can impersonate, has verified 2FA and target workspace allows it', async () => {
      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: true,
        twoFactorAuthenticationMethods: VERIFIED_TWO_FACTOR_METHODS,
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-2',
        allowImpersonation: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({ allowed: true, level: 'server' });
      expect(userHasWorkspaceSettingPermissionMock).not.toHaveBeenCalled();
    });

    it('should deny when impersonator can impersonate but has no verified 2FA (production)', async () => {
      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: true,
        twoFactorAuthenticationMethods: [],
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-2',
        allowImpersonation: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'server',
        reason: 'SERVER_LEVEL_2FA_REQUIRED',
      });
    });

    it('should allow server-level impersonation without 2FA in development', async () => {
      twentyConfigServiceGetMock.mockImplementation((key: string) =>
        key === 'NODE_ENV' ? NodeEnvironment.DEVELOPMENT : undefined,
      );

      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: true,
        twoFactorAuthenticationMethods: [],
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-2',
        allowImpersonation: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({ allowed: true, level: 'server' });
    });

    it('should deny when impersonator cannot impersonate', async () => {
      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: false,
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-2',
        allowImpersonation: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'server',
        reason: 'SERVER_LEVEL_NOT_ALLOWED',
      });
    });

    it('should deny when target workspace does not allow impersonation', async () => {
      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: true,
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-2',
        allowImpersonation: false,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'server',
        reason: 'SERVER_LEVEL_NOT_ALLOWED',
      });
    });

    it('should NOT apply the admin-privilege check at server level (a server-level impersonator may impersonate an admin)', async () => {
      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: true,
        canAccessFullAdminPanel: false,
        twoFactorAuthenticationMethods: VERIFIED_TWO_FACTOR_METHODS,
      });
      const target = buildUserWorkspace({
        userId: 'admin-target',
        workspaceId: 'workspace-2',
        allowImpersonation: true,
        canAccessFullAdminPanel: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({ allowed: true, level: 'server' });
    });
  });

  describe('workspace-level impersonation', () => {
    it('should allow when impersonator has the IMPERSONATE permission and target is not an admin', async () => {
      userHasWorkspaceSettingPermissionMock.mockResolvedValue(true);

      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-1',
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({ allowed: true, level: 'workspace' });
      expect(userHasWorkspaceSettingPermissionMock).toHaveBeenCalledWith({
        userWorkspaceId: impersonator.id,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId: target.workspace.id,
      });
    });

    it('should deny when impersonator lacks the IMPERSONATE permission', async () => {
      userHasWorkspaceSettingPermissionMock.mockResolvedValue(false);

      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
      });
      const target = buildUserWorkspace({
        userId: 'target',
        workspaceId: 'workspace-1',
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'workspace',
        reason: 'WORKSPACE_LEVEL_NOT_ALLOWED',
      });
    });

    it('should deny when a non-admin tries to impersonate an admin (canAccessFullAdminPanel)', async () => {
      userHasWorkspaceSettingPermissionMock.mockResolvedValue(true);

      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: false,
        canAccessFullAdminPanel: false,
      });
      const target = buildUserWorkspace({
        userId: 'admin-target',
        workspaceId: 'workspace-1',
        canAccessFullAdminPanel: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'workspace',
        reason: 'TARGET_HAS_ADMIN_PRIVILEGES',
      });
    });

    it('should deny when a non-admin tries to impersonate an admin (canImpersonate)', async () => {
      userHasWorkspaceSettingPermissionMock.mockResolvedValue(true);

      const impersonator = buildUserWorkspace({
        userId: 'impersonator',
        workspaceId: 'workspace-1',
        canImpersonate: false,
        canAccessFullAdminPanel: false,
      });
      const target = buildUserWorkspace({
        userId: 'admin-target',
        workspaceId: 'workspace-1',
        canImpersonate: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({
        allowed: false,
        level: 'workspace',
        reason: 'TARGET_HAS_ADMIN_PRIVILEGES',
      });
    });

    it('should allow an admin to impersonate another admin', async () => {
      userHasWorkspaceSettingPermissionMock.mockResolvedValue(true);

      const impersonator = buildUserWorkspace({
        userId: 'admin-impersonator',
        workspaceId: 'workspace-1',
        canAccessFullAdminPanel: true,
      });
      const target = buildUserWorkspace({
        userId: 'admin-target',
        workspaceId: 'workspace-1',
        canAccessFullAdminPanel: true,
      });

      const result = await service.checkImpersonationAuthorization(
        impersonator,
        target,
      );

      expect(result).toEqual({ allowed: true, level: 'workspace' });
    });
  });
});
