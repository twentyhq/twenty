import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let userVarsService: UserVarsService;
  let billingCreditService: BillingCreditService;
  let twentyConfigService: TwentyConfigService;

  const userId = 'user-id';
  const workspaceId = 'workspace-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: BillingService,
          useValue: {
            isSubscriptionIncompleteOnboardingStatus: jest.fn(),
          },
        },
        {
          provide: BillingCreditService,
          useValue: {
            creditWorkspaceBalance: jest.fn(),
          },
        },
        {
          provide: UserVarsService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    userVarsService = module.get<UserVarsService>(UserVarsService);
    billingCreditService =
      module.get<BillingCreditService>(BillingCreditService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('completeOnboardingConnectAccountStep', () => {
    it('should credit the import-contacts reward when the step was claimed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(userVarsService.delete).toHaveBeenCalledWith({
        userId,
        workspaceId,
        key: OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      });
      expect(billingCreditService.creditWorkspaceBalance).toHaveBeenCalledWith({
        workspaceId,
        amountMicro: 2_000_000,
      });
    });

    it('should not credit anything when the step was already consumed', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(0);

      await service.completeOnboardingConnectAccountStep({
        userId,
        workspaceId,
      });

      expect(
        billingCreditService.creditWorkspaceBalance,
      ).not.toHaveBeenCalled();
    });

    it('should credit only once when two completions race for the same step', async () => {
      jest
        .spyOn(userVarsService, 'delete')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);

      await Promise.all([
        service.completeOnboardingConnectAccountStep({ userId, workspaceId }),
        service.completeOnboardingConnectAccountStep({ userId, workspaceId }),
      ]);

      expect(billingCreditService.creditWorkspaceBalance).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should not throw when crediting fails', async () => {
      jest.spyOn(userVarsService, 'delete').mockResolvedValue(1);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(2_000_000);
      jest
        .spyOn(billingCreditService, 'creditWorkspaceBalance')
        .mockRejectedValue(new Error('billing failure'));

      await expect(
        service.completeOnboardingConnectAccountStep({
          userId,
          workspaceId,
        }),
      ).resolves.not.toThrow();
    });
  });
});
