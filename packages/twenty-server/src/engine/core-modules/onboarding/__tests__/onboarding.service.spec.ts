import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;

  const userId = 'user-id';
  const workspaceId = 'workspace-id';
  const creditTiers = {
    midMarket: { minEmployeeCount: 20, amountMicro: 5_000_000 },
  };

  // The book-call step deliberately asks for a far bigger company than the
  // credit reward, so the two bars cannot be confused for one another.
  const bookCallMinEmployeeCount = 200;

  const configValues: Record<string, unknown> = {
    CALENDAR_BOOKING_PAGE_ID: 'team/twenty/talk-to-us',
    ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT: bookCallMinEmployeeCount,
    ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS: creditTiers,
  };

  const grantCredits = jest.fn();
  const captureExceptions = jest.fn();
  const setIfNotExists = jest.fn();
  const getConfig = jest.fn();

  beforeEach(async () => {
    grantCredits.mockResolvedValue(null);
    setIfNotExists.mockResolvedValue(true);
    getConfig.mockImplementation((key: string) => configValues[key]);

    const dataSource = {
      transaction: jest.fn((runInTransaction) =>
        runInTransaction({ queryRunner: {} }),
      ),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        { provide: BillingService, useValue: { isBillingEnabled: jest.fn() } },
        { provide: BillingCreditService, useValue: { grantCredits } },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions },
        },
        {
          provide: UserVarsService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            setIfNotExists,
          },
        },
        { provide: TwentyConfigService, useValue: { get: getConfig } },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: {} },
        { provide: getRepositoryToken(UserWorkspaceEntity), useValue: {} },
        {
          provide: getQueueToken(MessageQueue.workspaceQueue),
          useValue: { add: jest.fn() },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('creditEnrichmentQualificationReward', () => {
    it('grants the amount of the tier the enriched company lands in', async () => {
      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: 20,
      });

      expect(grantCredits).toHaveBeenCalledTimes(1);
      expect(grantCredits).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          amountMicro: 5_000_000,
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          idempotencyKey: `onboarding-enrichment-qualified:${workspaceId}`,
        }),
      );
    });

    it('grants nothing to a company below every tier', async () => {
      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: 19,
      });

      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('grants nothing to a workspace enrichment could not match', async () => {
      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: null,
      });

      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('grants nothing while no tier is configured', async () => {
      getConfig.mockImplementation((key: string) =>
        key === 'ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS'
          ? {}
          : configValues[key],
      );

      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: 5000,
      });

      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('swallows a billing failure so enrichment still completes', async () => {
      grantCredits.mockRejectedValue(new Error('billing is down'));

      await expect(
        service.creditEnrichmentQualificationReward({
          workspaceId,
          employeeCount: 5000,
        }),
      ).resolves.toBeUndefined();
    });

    it('reports malformed tiers to Sentry and pays the well-formed ones', async () => {
      getConfig.mockImplementation((key: string) =>
        key === 'ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS'
          ? { broken: { minEmployeeCount: 'twenty' }, ...creditTiers }
          : configValues[key],
      );

      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: 20,
      });

      expect(captureExceptions).toHaveBeenCalledTimes(1);
      expect(captureExceptions.mock.calls[0][0][0].message).toContain('broken');
      expect(grantCredits).toHaveBeenCalledWith(
        expect.objectContaining({ amountMicro: 5_000_000 }),
      );
    });

    it('survives a tier config too malformed to even read, and reports it', async () => {
      // The JSON config transformer throws rather than returning a value when
      // the configured tiers are not a parseable object.
      getConfig.mockImplementation((key: string) => {
        if (key === 'ONBOARDING_ENRICHMENT_CREDIT_REWARD_TIERS') {
          throw new Error('Failed to parse JSON string');
        }

        return configValues[key];
      });

      await expect(
        service.creditEnrichmentQualificationReward({
          workspaceId,
          employeeCount: 20,
        }),
      ).resolves.toBeUndefined();

      expect(grantCredits).not.toHaveBeenCalled();
      expect(captureExceptions).toHaveBeenCalledTimes(1);
    });

    it('grants credits even when the book-a-call step is switched off', async () => {
      getConfig.mockImplementation((key: string) =>
        key === 'CALENDAR_BOOKING_PAGE_ID' ||
        key === 'ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT'
          ? undefined
          : configValues[key],
      );

      await service.creditEnrichmentQualificationReward({
        workspaceId,
        employeeCount: 20,
      });

      expect(grantCredits).toHaveBeenCalledWith(
        expect.objectContaining({ amountMicro: 5_000_000 }),
      );
    });
  });

  describe('setOnboardingBookCallPendingIfQualified', () => {
    it('offers the call without granting credits', async () => {
      const hasQualified =
        await service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: bookCallMinEmployeeCount,
        });

      expect(hasQualified).toBe(true);
      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('withholds the call from a company that only clears the credit tier', async () => {
      const hasQualified =
        await service.setOnboardingBookCallPendingIfQualified({
          userId,
          workspaceId,
          employeeCount: 20,
        });

      expect(hasQualified).toBe(false);
    });
  });
});
