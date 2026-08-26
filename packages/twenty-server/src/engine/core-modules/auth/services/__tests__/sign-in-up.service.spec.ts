import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const SIGN_UP_PARAMS = {
  newUserParams: { email: 'stranger@example.com' },
  authParams: {
    provider: AuthProviderEnum.Password,
    password: 'Test123!@#',
  },
} as const;

describe('SignInUpService', () => {
  let signInUpService: SignInUpService;
  let workspaceRepository: { count: jest.Mock };
  let userRepository: { count: jest.Mock };
  let userService: { findUserByEmail: jest.Mock };
  let userWorkspaceService: { findAvailableWorkspacesByEmail: jest.Mock };
  let twentyConfigService: { get: jest.Mock };

  const mockConfig = (values: Record<string, unknown>) => {
    twentyConfigService.get.mockImplementation((key: string) => values[key]);
  };

  const mockAvailableWorkspacesForSignUp = (
    activationStatuses: WorkspaceActivationStatus[],
  ) => {
    userWorkspaceService.findAvailableWorkspacesByEmail.mockResolvedValue({
      availableWorkspacesForSignIn: [],
      availableWorkspacesForSignUp: activationStatuses.map(
        (activationStatus) => ({ workspace: { activationStatus } }),
      ),
    });
  };

  beforeEach(async () => {
    workspaceRepository = { count: jest.fn().mockResolvedValue(1) };
    userRepository = { count: jest.fn().mockResolvedValue(1) };
    userService = { findUserByEmail: jest.fn().mockResolvedValue(null) };
    userWorkspaceService = {
      findAvailableWorkspacesByEmail: jest.fn(),
    };
    twentyConfigService = { get: jest.fn() };

    mockAvailableWorkspacesForSignUp([]);

    const optionalProviders = [
      WorkspaceInvitationService,
      OnboardingService,
      WorkspaceEventEmitter,
      SubdomainManagerService,
      MetricsService,
      WorkspaceCacheService,
      ApplicationService,
      FileCorePictureService,
      EnterprisePlanService,
      EventLogEmitterService,
      BillingCreditService,
      BillingService,
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
        { provide: UserService, useValue: userService },
        { provide: UserWorkspaceService, useValue: userWorkspaceService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
        { provide: getDataSourceToken(), useValue: { transaction: jest.fn() } },
        ...optionalProviders.map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();

    signInUpService = module.get<SignInUpService>(SignInUpService);

    jest
      .spyOn(
        signInUpService as unknown as {
          saveNewUser: () => Promise<UserEntity>;
        },
        'saveNewUser',
      )
      .mockResolvedValue({ id: 'user-id' } as UserEntity);
  });

  describe('signUpWithoutWorkspace', () => {
    it('should refuse a sign up that has nowhere to land when workspace creation is restricted', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: true,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: true,
      });

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).rejects.toMatchObject({ code: AuthExceptionCode.SIGNUP_DISABLED });
    });

    it('should allow an invited user to sign up when workspace creation is restricted', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: true,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: true,
      });
      mockAvailableWorkspacesForSignUp([WorkspaceActivationStatus.ACTIVE]);

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).resolves.toEqual({ id: 'user-id' });
    });

    it('should refuse a sign up whose only destination is not provisioned yet', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: true,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: true,
      });
      mockAvailableWorkspacesForSignUp([
        WorkspaceActivationStatus.PENDING_CREATION,
      ]);

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).rejects.toMatchObject({ code: AuthExceptionCode.SIGNUP_DISABLED });
    });

    it('should allow a sign up into a suspended workspace it can still be a member of', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: true,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: true,
      });
      mockAvailableWorkspacesForSignUp([
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.SUSPENDED,
      ]);

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).resolves.toEqual({ id: 'user-id' });
    });

    it('should allow the first sign up of a fresh instance when workspace creation is restricted', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: false,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: true,
      });
      workspaceRepository.count.mockResolvedValue(0);

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).resolves.toEqual({ id: 'user-id' });
    });

    // Unrestricted instances must not pay for the extra lookup this guard needs.
    it('should not look up available workspaces when workspace creation is unrestricted', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: true,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: false,
      });

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).resolves.toEqual({ id: 'user-id' });

      expect(
        userWorkspaceService.findAvailableWorkspacesByEmail,
      ).not.toHaveBeenCalled();
    });

    it('should still refuse a sign up when multi-workspace is disabled', async () => {
      mockConfig({
        IS_MULTIWORKSPACE_ENABLED: false,
        IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS: false,
      });

      await expect(
        signInUpService.signUpWithoutWorkspace(
          SIGN_UP_PARAMS.newUserParams,
          SIGN_UP_PARAMS.authParams,
        ),
      ).rejects.toMatchObject({ code: AuthExceptionCode.SIGNUP_DISABLED });
    });
  });
});
