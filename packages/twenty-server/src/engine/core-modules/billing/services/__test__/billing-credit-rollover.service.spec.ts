/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditRolloverService } from 'src/engine/core-modules/billing/services/billing-credit-rollover.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const workspaceId = 'ws_123';
const CLOSING_PERIOD_START = new Date('2026-01-01T00:00:00.000Z');
const CLOSING_PERIOD_END = new Date('2026-02-01T00:00:00.000Z');
const NEXT_PERIOD_END = new Date('2026-03-01T00:00:00.000Z');
const ALLOWANCE = 1_000_000;
const ROLLOVER_ADJUSTMENT_KEY = `rollover:${CLOSING_PERIOD_END.toISOString()}`;

const baseParams = {
  workspaceId,
  closingPeriodStart: CLOSING_PERIOD_START,
  closingPeriodEnd: CLOSING_PERIOD_END,
  closingAllowanceMicro: ALLOWANCE,
  nextPeriodStart: CLOSING_PERIOD_END,
  nextPeriodEnd: NEXT_PERIOD_END,
  nextAllowanceMicro: ALLOWANCE,
};

describe('BillingCreditRolloverService', () => {
  let service: BillingCreditRolloverService;
  let billingUsageService: jest.Mocked<{
    getCreditsUsedBetweenOrNull: jest.Mock;
  }>;
  let billingCreditGrantService: jest.Mocked<{
    findGrantsLiveDuringPeriod: jest.Mock;
    closeGrantsAtPeriodEnd: jest.Mock;
    createGrant: jest.Mock;
    materializeLegacyBalance: jest.Mock;
  }>;
  let billingCreditService: jest.Mocked<{
    refreshWorkspaceCreditState: jest.Mock;
    hasCounterAdjustmentBeenApplied: jest.Mock;
  }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCreditRolloverService,
        {
          provide: BillingUsageService,
          useValue: {
            getCreditsUsedBetweenOrNull: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: BillingCreditGrantService,
          useValue: {
            findGrantsLiveDuringPeriod: jest.fn().mockResolvedValue([]),
            closeGrantsAtPeriodEnd: jest.fn().mockResolvedValue(undefined),
            createGrant: jest
              .fn()
              .mockImplementation((params) =>
                Promise.resolve({ id: 'grant_new', ...params }),
              ),
            materializeLegacyBalance: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BillingCreditService,
          useValue: {
            refreshWorkspaceCreditState: jest.fn().mockResolvedValue(undefined),
            hasCounterAdjustmentBeenApplied: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((fn: () => unknown) => fn()) },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(2) },
        },
      ],
    }).compile();

    service = module.get<BillingCreditRolloverService>(
      BillingCreditRolloverService,
    );
    billingUsageService = module.get(BillingUsageService);
    billingCreditGrantService = module.get(BillingCreditGrantService);
    billingCreditService = module.get(BillingCreditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processRolloverOnPeriodTransition', () => {
    it('grants the unspent allowance for the new period', async () => {
      billingUsageService.getCreditsUsedBetweenOrNull.mockResolvedValue(
        300_000,
      );

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          amountMicro: 700_000,
          type: BillingCreditGrantType.ROLLOVER,
          effectiveAt: CLOSING_PERIOD_END,
          expiresAt: NEXT_PERIOD_END,
        }),
      );
    });

    it('reads usage over the closing period, not the one that just started', async () => {
      await service.processRolloverOnPeriodTransition(baseParams);

      expect(
        billingUsageService.getCreditsUsedBetweenOrNull,
      ).toHaveBeenCalledWith({
        workspaceId,
        from: CLOSING_PERIOD_START,
        to: CLOSING_PERIOD_END,
      });
    });

    it('grants nothing when the whole allowance was spent', async () => {
      billingUsageService.getCreditsUsedBetweenOrNull.mockResolvedValue(
        ALLOWANCE,
      );

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).not.toHaveBeenCalled();
    });

    it('refreshes the credit state once even when nothing carried forward', async () => {
      billingUsageService.getCreditsUsedBetweenOrNull.mockResolvedValue(
        ALLOWANCE,
      );

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).toHaveBeenCalledTimes(1);
      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).toHaveBeenCalledWith({
        workspaceId,
        availableDeltaMicro: 0,
        rebuildCounter: false,
        adjustmentKey: ROLLOVER_ADJUSTMENT_KEY,
      });
    });

    // A redelivery after the rows were inserted carries nothing forward, so a
    // delta of zero would leave the carried credits out of the counter for the
    // whole period.
    it('rebuilds the counter when the carry-forward grants were replayed', async () => {
      billingCreditGrantService.createGrant.mockResolvedValue(null);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).toHaveBeenCalledWith({
        workspaceId,
        availableDeltaMicro: 0,
        rebuildCounter: true,
        adjustmentKey: ROLLOVER_ADJUSTMENT_KEY,
      });
    });

    // Stripe redelivers events it already handled, and rebuilding then would
    // recompute from ClickHouse and credit back usage it has not ingested yet.
    it('leaves the counter alone when the replayed transition already moved it', async () => {
      billingCreditGrantService.createGrant.mockResolvedValue(null);
      billingCreditService.hasCounterAdjustmentBeenApplied.mockResolvedValue(
        true,
      );

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).toHaveBeenCalledWith({
        workspaceId,
        availableDeltaMicro: 0,
        rebuildCounter: false,
        adjustmentKey: ROLLOVER_ADJUSTMENT_KEY,
      });
    });

    it('refreshes the credit state once for the whole transition', async () => {
      billingCreditGrantService.findGrantsLiveDuringPeriod.mockResolvedValue([
        {
          id: 'compensation_1',
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          createdAt: CLOSING_PERIOD_START,
        },
      ]);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledTimes(2);
      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).toHaveBeenCalledTimes(1);
    });

    it('caps the rollover so the new period totals at most twice the allowance', async () => {
      billingCreditGrantService.findGrantsLiveDuringPeriod.mockResolvedValue([
        {
          id: 'previous_rollover',
          type: BillingCreditGrantType.ROLLOVER,
          amountMicro: ALLOWANCE,
          createdAt: CLOSING_PERIOD_START,
        },
      ]);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledTimes(1);
      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({ amountMicro: ALLOWANCE }),
      );
    });

    it('carries a compensation grant over untouched by the cap', async () => {
      billingCreditGrantService.findGrantsLiveDuringPeriod.mockResolvedValue([
        {
          id: 'compensation_1',
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 200_000_000,
          createdAt: CLOSING_PERIOD_START,
        },
      ]);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          amountMicro: 200_000_000,
          type: BillingCreditGrantType.COMPENSATION,
          sourceGrantId: 'compensation_1',
        }),
      );
    });

    it('closes the grants it carried forward so they cannot be counted twice', async () => {
      billingCreditGrantService.findGrantsLiveDuringPeriod.mockResolvedValue([
        {
          id: 'compensation_1',
          type: BillingCreditGrantType.COMPENSATION,
          amountMicro: 500_000,
          createdAt: CLOSING_PERIOD_START,
        },
      ]);

      await service.processRolloverOnPeriodTransition(baseParams);

      expect(
        billingCreditGrantService.closeGrantsAtPeriodEnd,
      ).toHaveBeenCalledWith({
        workspaceId,
        periodEnd: CLOSING_PERIOD_END,
      });
    });

    it('gives every carried grant a replay-safe idempotency key', async () => {
      await service.processRolloverOnPeriodTransition(baseParams);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey: `carry-forward:${workspaceId}:${CLOSING_PERIOD_END.toISOString()}:ROLLOVER:allowance`,
        }),
      );
    });

    // Returning normally would answer the webhook 200 and Stripe would never
    // redeliver, so the transition would never run: no grant closed, nothing
    // carried forward, and the balance lost at expiry.
    it('fails the transition when usage could not be read so Stripe redelivers', async () => {
      billingUsageService.getCreditsUsedBetweenOrNull.mockResolvedValue(null);

      await expect(
        service.processRolloverOnPeriodTransition(baseParams),
      ).rejects.toMatchObject({
        code: BillingExceptionCode.BILLING_USAGE_UNAVAILABLE,
      });

      expect(billingCreditGrantService.createGrant).not.toHaveBeenCalled();
      expect(
        billingCreditGrantService.closeGrantsAtPeriodEnd,
      ).not.toHaveBeenCalled();
      expect(
        billingCreditService.refreshWorkspaceCreditState,
      ).not.toHaveBeenCalled();
    });

    it('carries trial credits into the first paid period', async () => {
      const trialAllowance = 500_000;

      billingCreditGrantService.findGrantsLiveDuringPeriod.mockResolvedValue([
        {
          id: 'reward_1',
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          amountMicro: 1_000_000,
          createdAt: CLOSING_PERIOD_START,
        },
      ]);
      billingUsageService.getCreditsUsedBetweenOrNull.mockResolvedValue(
        200_000,
      );

      await service.processRolloverOnPeriodTransition({
        ...baseParams,
        closingAllowanceMicro: trialAllowance,
      });

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          amountMicro: 300_000,
          type: BillingCreditGrantType.ROLLOVER,
        }),
      );
      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          amountMicro: 1_000_000,
          type: BillingCreditGrantType.ONBOARDING_REWARD,
          sourceGrantId: 'reward_1',
        }),
      );
    });
  });
});
