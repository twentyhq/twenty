import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userVarsService: { getAll: jest.Mock; get: jest.Mock };
  let featureFlagService: { isFeatureEnabled: jest.Mock };

  const workspaceId = 'workspace-id';
  const user = { id: 'user-id' } as UserEntity;

  const buildUserVars = (entries: Record<string, boolean>) =>
    new Map<string, boolean>(Object.entries(entries));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: BillingService,
          useValue: {
            isSubscriptionIncompleteOnboardingStatus: jest
              .fn()
              .mockResolvedValue(false),
          },
        },
        {
          provide: UserVarsService,
          useValue: { getAll: jest.fn(), get: jest.fn() },
        },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        {
          provide: FeatureFlagService,
          useValue: { isFeatureEnabled: jest.fn().mockResolvedValue(false) },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: workspaceId,
              activationStatus: WorkspaceActivationStatus.ACTIVE,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(OnboardingService);
    userVarsService = module.get(UserVarsService);
    featureFlagService = module.get(FeatureFlagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOnboardingStatus step ordering', () => {
    it('returns SYNC_EMAIL before PROFILE_CREATION when invite suggestions are enabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userVarsService.getAll.mockResolvedValue(
        buildUserVars({
          [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING]: true,
          [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING]: true,
        }),
      );

      const result = await service.getOnboardingStatus({ user, workspaceId });

      expect(result).toBe(OnboardingStatus.SYNC_EMAIL);
    });

    it('returns PROFILE_CREATION before SYNC_EMAIL when invite suggestions are disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);
      userVarsService.getAll.mockResolvedValue(
        buildUserVars({
          [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING]: true,
          [OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING]: true,
        }),
      );

      const result = await service.getOnboardingStatus({ user, workspaceId });

      expect(result).toBe(OnboardingStatus.PROFILE_CREATION);
    });

    it('falls back to PROFILE_CREATION when only profile is pending and suggestions are enabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userVarsService.getAll.mockResolvedValue(
        buildUserVars({
          [OnboardingStepKeys.ONBOARDING_CREATE_PROFILE_PENDING]: true,
        }),
      );

      const result = await service.getOnboardingStatus({ user, workspaceId });

      expect(result).toBe(OnboardingStatus.PROFILE_CREATION);
    });
  });

  describe('shouldComputeInviteSuggestionsOnConnect', () => {
    it('returns false when userId is missing', async () => {
      const result = await service.shouldComputeInviteSuggestionsOnConnect({
        userId: undefined,
        workspaceId,
      });

      expect(result).toBe(false);
      expect(userVarsService.get).not.toHaveBeenCalled();
    });

    it('returns false when the connect-account step is not pending', async () => {
      userVarsService.get.mockResolvedValue(undefined);

      const result = await service.shouldComputeInviteSuggestionsOnConnect({
        userId: 'user-id',
        workspaceId,
      });

      expect(result).toBe(false);
      expect(featureFlagService.isFeatureEnabled).not.toHaveBeenCalled();
    });

    it('returns false when the connect-account step is pending but the flag is disabled', async () => {
      userVarsService.get.mockResolvedValue(true);
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const result = await service.shouldComputeInviteSuggestionsOnConnect({
        userId: 'user-id',
        workspaceId,
      });

      expect(result).toBe(false);
    });

    it('returns true when the connect-account step is pending and the flag is enabled', async () => {
      userVarsService.get.mockResolvedValue(true);
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

      const result = await service.shouldComputeInviteSuggestionsOnConnect({
        userId: 'user-id',
        workspaceId,
      });

      expect(result).toBe(true);
      expect(featureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
        FeatureFlagKey.IS_ONBOARDING_INVITE_SUGGESTIONS_ENABLED,
        workspaceId,
      );
    });
  });
});
