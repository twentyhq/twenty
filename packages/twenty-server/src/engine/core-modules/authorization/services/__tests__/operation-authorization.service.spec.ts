import { PermissionFlagType } from 'twenty-shared/constants';

import {
  startWorkspaceAuthContext,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const memberAuthContext = {
  type: 'user',
  workspace: { id: 'workspace-id' },
  userWorkspaceId: 'user-workspace-id',
} as WorkspaceAuthContext;

const POLICY: OperationPolicy = {
  name: 'test.operation',
  authPrincipal: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: false,
  },
  permissionFlags: [PermissionFlagType.WORKFLOWS],
};

const buildService = (isGranted = true) => {
  const permissionsService = {
    checkRolesPermissions: jest.fn().mockResolvedValue(isGranted),
  } as unknown as PermissionsService;
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      userWorkspaceRoleMap: { 'user-workspace-id': 'member-role-id' },
      apiKeyRoleMap: {},
      flatRoleTargetByAgentIdMaps: {},
    }),
  } as unknown as WorkspaceCacheService;

  return {
    service: new OperationAuthorizationService(
      permissionsService,
      workspaceCacheService,
    ),
    permissionsService,
  };
};

const asMember = <TResult>(callback: () => Promise<TResult>) =>
  startWorkspaceAuthContext(
    {
      authContext: memberAuthContext,
      principal: { kind: 'userSession', variant: 'standard' },
    },
    callback,
  );

describe('OperationAuthorizationService', () => {
  it('should not evaluate the policy again once the edge authorized it', async () => {
    const { service, permissionsService } = buildService();

    await asMember(async () => {
      await service.authorizeOrThrow(POLICY);
      await service.ensureAuthorized(POLICY);
      await service.ensureAuthorized(POLICY);
    });

    expect(permissionsService.checkRolesPermissions).toHaveBeenCalledTimes(1);
  });

  it('should evaluate the policy when no edge authorized it', async () => {
    const { service, permissionsService } = buildService();

    await asMember(() => service.ensureAuthorized(POLICY));

    expect(permissionsService.checkRolesPermissions).toHaveBeenCalledTimes(1);
  });

  it('should refuse a principal the policy leaves out, before reading roles', async () => {
    const { service, permissionsService } = buildService();

    await expect(
      startWorkspaceAuthContext(
        {
          authContext: memberAuthContext,
          principal: {
            kind: 'application',
            variant: 'withUser',
            withAgent: false,
          },
        },
        () => service.authorizeOrThrow(POLICY),
      ),
    ).rejects.toBeInstanceOf(AuthPrincipalRefusedException);
    expect(permissionsService.checkRolesPermissions).not.toHaveBeenCalled();
  });

  it('should refuse an unattested flow', async () => {
    const { service } = buildService();

    await expect(
      withWorkspaceAuthContext(memberAuthContext, () =>
        service.authorizeOrThrow(POLICY),
      ),
    ).rejects.toBeInstanceOf(AuthPrincipalRefusedException);
  });

  it('should refuse a caller missing a permission flag', async () => {
    const { service } = buildService(false);

    await expect(
      asMember(() => service.authorizeOrThrow(POLICY)),
    ).rejects.toBeInstanceOf(AuthPrincipalRefusedException);
  });
});
