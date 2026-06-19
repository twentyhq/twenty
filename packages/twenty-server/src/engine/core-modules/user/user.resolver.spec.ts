import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceMemberTranspiler } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserResolver } from 'src/engine/core-modules/user/user.resolver';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let refreshWorkspaceIfPendingOrOngoingCreation: jest.Mock;

  beforeEach(async () => {
    refreshWorkspaceIfPendingOrOngoingCreation = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {},
        },
        {
          provide: UserService,
          useValue: { refreshWorkspaceIfPendingOrOngoingCreation },
        },
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: OnboardingService,
          useValue: {},
        },
        {
          provide: UserVarsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {},
        },
        {
          provide: UserRoleService,
          useValue: {},
        },
        {
          provide: PermissionsService,
          useValue: {},
        },
        {
          provide: WorkspaceMemberTranspiler,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get(UserResolver);
  });

  describe('currentWorkspace', () => {
    // Regression for the "stuck on /sync/emails after sign-up" bug: the auth
    // context workspace (request.workspace) is read from the per-instance core
    // entity cache and can still be PENDING/ONGOING_CREATION right after
    // activateWorkspace. Returning it verbatim left the freshly-activated
    // workspace looking inactive to the client, so onboarding pages that gate
    // on an active workspace never finished loading. The field must refresh it,
    // consistent with the onboardingStatus field.
    it('should return the refreshed workspace for a stale pending/ongoing cache snapshot', async () => {
      const staleWorkspace = {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
      } as WorkspaceEntity;
      const refreshedWorkspace = {
        id: 'workspace-id',
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      } as WorkspaceEntity;

      refreshWorkspaceIfPendingOrOngoingCreation.mockResolvedValue(
        refreshedWorkspace,
      );

      const result = await resolver.currentWorkspace(staleWorkspace);

      expect(refreshWorkspaceIfPendingOrOngoingCreation).toHaveBeenCalledWith(
        staleWorkspace,
      );
      expect(result).toBe(refreshedWorkspace);
      expect(result?.activationStatus).toBe(WorkspaceActivationStatus.ACTIVE);
    });

    it('should return undefined without refreshing when there is no workspace', async () => {
      const result = await resolver.currentWorkspace(undefined);

      expect(result).toBeUndefined();
      expect(
        refreshWorkspaceIfPendingOrOngoingCreation,
      ).not.toHaveBeenCalled();
    });
  });
});
