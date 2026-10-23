import { type ExecutionContext, ForbiddenException } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const ROLE_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.ROLES],
};

const activeWorkspace = {
  id: 'workspace-id',
  activationStatus: WorkspaceActivationStatus.ACTIVE,
};

const memberRequest = {
  user: { id: 'user-id' },
  workspace: activeWorkspace,
  userWorkspaceId: 'user-workspace-id',
  tokenType: JwtTokenTypeEnum.ACCESS,
};

const applicationRequest = {
  application: {
    id: 'application-id',
    sourceType: ApplicationRegistrationSourceType.NPM,
  },
  workspace: activeWorkspace,
  tokenType: JwtTokenTypeEnum.APPLICATION_ACCESS,
};

const buildHttpContext = (request: unknown): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const buildGuard = ({
  accessPolicy = ROLE_WRITE_ACCESS_POLICY,
  isGranted = true,
  enabledFeatureFlags = [],
}: {
  accessPolicy?: AccessPolicy;
  isGranted?: boolean;
  enabledFeatureFlags?: FeatureFlagKey[];
} = {}) => {
  const permissionsService = {
    userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(isGranted),
  };
  const featureFlagService = {
    isFeatureEnabled: jest.fn(async (featureFlag: FeatureFlagKey) =>
      enabledFeatureFlags.includes(featureFlag),
    ),
  };
  const Guard = AccessPolicyGuard(accessPolicy);

  return {
    guard: new Guard(
      featureFlagService as unknown as FeatureFlagService,
      permissionsService as unknown as PermissionsService,
    ),
    permissionsService,
  };
};

describe('AccessPolicyGuard', () => {
  it('should let a principal the policy accepts through once its permission flags are granted', async () => {
    const { guard, permissionsService } = buildGuard();

    expect(await guard.canActivate(buildHttpContext(memberRequest))).toBe(true);
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith({
      userWorkspaceId: 'user-workspace-id',
      setting: PermissionFlagType.ROLES,
      workspaceId: 'workspace-id',
      apiKeyId: undefined,
      applicationId: undefined,
      agentId: undefined,
    });
  });

  it('should refuse a principal the policy refuses before checking its permission flags', async () => {
    const { guard, permissionsService } = buildGuard();

    await expect(
      guard.canActivate(buildHttpContext(applicationRequest)),
    ).rejects.toBeInstanceOf(AuthPrincipalRefusedException);
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).not.toHaveBeenCalled();
  });

  it('should refuse a missing permission flag as SettingsPermissionGuard does', async () => {
    const { guard } = buildGuard({ isGranted: false });

    await expect(
      guard.canActivate(buildHttpContext(memberRequest)),
    ).rejects.toMatchObject({
      constructor: PermissionsException,
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
  });

  it('should refuse a disabled feature flag as FeatureFlagGuard does', async () => {
    const { guard } = buildGuard({
      accessPolicy: {
        ...ROLE_WRITE_ACCESS_POLICY,
        requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
      },
    });

    await expect(
      guard.canActivate(buildHttpContext(memberRequest)),
    ).rejects.toEqual(
      new ForbiddenException(
        `Feature flag "${FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED}" is not enabled for this workspace`,
      ),
    );
  });

  it('should not check permission flags while the workspace is being created', async () => {
    const { guard, permissionsService } = buildGuard({ isGranted: false });

    expect(
      await guard.canActivate(
        buildHttpContext({
          ...memberRequest,
          workspace: {
            ...activeWorkspace,
            activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
          },
        }),
      ),
    ).toBe(true);
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).not.toHaveBeenCalled();
  });
});
