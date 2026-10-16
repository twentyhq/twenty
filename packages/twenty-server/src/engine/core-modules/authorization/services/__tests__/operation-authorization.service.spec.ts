import { PermissionFlagType } from 'twenty-shared/constants';

import {
  startWorkspaceAuthContext,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { type OperationTarget } from 'src/engine/core-modules/authorization/types/operation-target.type';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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

const REACHABLE_FUNCTION_ID = 'reachable-function-id';
const OUT_OF_REACH_FUNCTION_ID = 'out-of-reach-function-id';

const flatLogicFunctionMaps = {
  byUniversalIdentifier: {
    reachable: { id: REACHABLE_FUNCTION_ID, applicationId: 'own-application' },
    outOfReach: {
      id: OUT_OF_REACH_FUNCTION_ID,
      applicationId: 'other-application',
    },
  },
  universalIdentifierById: {
    [REACHABLE_FUNCTION_ID]: 'reachable',
    [OUT_OF_REACH_FUNCTION_ID]: 'outOfReach',
  },
  universalIdentifiersByApplicationId: {},
};

const buildTarget = (id: string): OperationTarget => ({
  metadataName: 'logicFunction',
  id,
  access: 'manage',
  createOutOfReachException: () => new Error('Logic function not found'),
});

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

  const applicationReachService = {
    canReachApplication: jest
      .fn()
      .mockImplementation(
        async ({ applicationId }: { applicationId: string }) =>
          applicationId === 'own-application',
      ),
  } as unknown as ApplicationReachService;

  return {
    service: new OperationAuthorizationService(
      permissionsService,
      workspaceCacheService,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest
          .fn()
          .mockResolvedValue({ flatLogicFunctionMaps }),
      } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
      applicationReachService,
    ),
    permissionsService,
    applicationReachService,
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

  describe('on a declared target', () => {
    it('should refuse a target out of the caller reach', async () => {
      const { service } = buildService();

      await expect(
        asMember(() =>
          service.ensureAuthorized(
            POLICY,
            buildTarget(OUT_OF_REACH_FUNCTION_ID),
          ),
        ),
      ).rejects.toThrow('Logic function not found');
    });

    it('should not check the same target again in one flow', async () => {
      const { service, applicationReachService } = buildService();

      await asMember(async () => {
        await service.ensureAuthorized(
          POLICY,
          buildTarget(REACHABLE_FUNCTION_ID),
        );
        await service.ensureAuthorized(
          POLICY,
          buildTarget(REACHABLE_FUNCTION_ID),
        );
      });

      expect(applicationReachService.canReachApplication).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should check another target even after the policy was authorized', async () => {
      const { service, permissionsService } = buildService();

      await expect(
        asMember(async () => {
          await service.ensureAuthorized(
            POLICY,
            buildTarget(REACHABLE_FUNCTION_ID),
          );
          await service.ensureAuthorized(
            POLICY,
            buildTarget(OUT_OF_REACH_FUNCTION_ID),
          );
        }),
      ).rejects.toThrow('Logic function not found');
      expect(permissionsService.checkRolesPermissions).toHaveBeenCalledTimes(1);
    });

    it('should leave an unknown id to the operation', async () => {
      const { service } = buildService();

      await expect(
        asMember(() =>
          service.ensureAuthorized(POLICY, buildTarget('unknown-id')),
        ),
      ).resolves.toBeUndefined();
    });
  });
});
