import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
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
  const minEmployeeCount = 20;
  const creditsReward = 5_000_000;

  const configValues: Record<string, unknown> = {
    CALENDAR_BOOKING_PAGE_ID: 'team/twenty/talk-to-us',
    ONBOARDING_BOOK_CALL_MIN_EMPLOYEE_COUNT: minEmployeeCount,
    ONBOARDING_BOOK_CALL_QUALIFICATION_CREDITS_REWARD: creditsReward,
  };

  const grantCredits = jest.fn();
  const setIfNotExists = jest.fn();
  const setUserVar = jest.fn();
  const getConfig = jest.fn();

  beforeEach(async () => {
    grantCredits.mockResolvedValue(null);
    setIfNotExists.mockResolvedValue(true);
    setUserVar.mockResolvedValue(undefined);
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
          provide: UserVarsService,
          useValue: {
            get: jest.fn(),
            set: setUserVar,
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

  describe('setOnboardingBookCallPendingIfQualified', () => {
    it('grants the qualification reward once the workspace clears the employee-count bar', async () => {
      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: minEmployeeCount },
      );

      expect(hasQualified).toBe(true);
      expect(grantCredits).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          amountMicro: creditsReward,
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          idempotencyKey: `onboarding-book-call-qualified:${workspaceId}`,
        }),
      );
    });

    it('grants nothing to a workspace below the employee-count bar', async () => {
      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: minEmployeeCount - 1 },
      );

      expect(hasQualified).toBe(false);
      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('grants nothing to a workspace enrichment could not match', async () => {
      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: null },
      );

      expect(hasQualified).toBe(false);
      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('grants nothing while the book-call step is unconfigured', async () => {
      getConfig.mockImplementation((key: string) =>
        key === 'CALENDAR_BOOKING_PAGE_ID' ? undefined : configValues[key],
      );

      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: minEmployeeCount },
      );

      expect(hasQualified).toBe(false);
      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('grants nothing when another qualification already claimed the offer', async () => {
      setIfNotExists.mockResolvedValue(false);

      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: minEmployeeCount },
      );

      expect(hasQualified).toBe(false);
      expect(grantCredits).not.toHaveBeenCalled();
    });

    it('still offers the call when granting the credits fails', async () => {
      grantCredits.mockRejectedValue(new Error('billing is down'));

      const hasQualified = await service.setOnboardingBookCallPendingIfQualified(
        { userId, workspaceId, employeeCount: minEmployeeCount },
      );

      expect(hasQualified).toBe(true);
      expect(setUserVar).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'ONBOARDING_BOOK_CALL_PENDING',
          value: true,
        }),
        expect.anything(),
      );
    });
  });
});
