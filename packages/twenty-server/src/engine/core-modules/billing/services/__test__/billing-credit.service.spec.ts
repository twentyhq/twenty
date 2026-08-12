/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';
import { BillingUsageCapService } from 'src/engine/core-modules/billing/services/billing-usage-cap.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const workspaceId = 'ws_123';
const DAY_IN_MS = 24 * 60 * 60 * 1000;
// Relative to now so the period stays current: a lapsed period end takes a
// different branch, which is covered by its own test below.
const PERIOD_START = new Date(Date.now() - 10 * DAY_IN_MS);
const PERIOD_END = new Date(Date.now() + 20 * DAY_IN_MS);

const subscription = {
  status: SubscriptionStatus.Active,
  currentPeriodStart: PERIOD_START,
  currentPeriodEnd: PERIOD_END,
  trialStart: null,
  trialEnd: null,
};

describe('BillingCreditService', () => {
  let service: BillingCreditService;
  let billingService: jest.Mocked<{ isBillingEnabled: jest.Mock }>;
  let billingCreditGrantService: jest.Mocked<{
    createGrant: jest.Mock;
    getActiveCreditsMicro: jest.Mock;
    revokeGrant: jest.Mock;
    materializeLegacyBalance: jest.Mock;
    hasAnyGrant: jest.Mock;
  }>;
  let billingSubscriptionService: jest.Mocked<{
    getCurrentBillingSubscription: jest.Mock;
  }>;
  let billingUsageCacheService: jest.Mocked<{
    getAvailableCredits: jest.Mock;
    adjustAvailableCredits: jest.Mock;
    invalidateAvailableCredits: jest.Mock;
    hasCounterAdjustmentBeenApplied: jest.Mock;
    markCounterAdjustmentApplied: jest.Mock;
  }>;
  let billingUsageCapService: jest.Mocked<{
    clearHasReachedCapForWorkspace: jest.Mock;
  }>;
  let cacheLockService: jest.Mocked<{ withLock: jest.Mock }>;
  let workspaceCacheService: jest.Mocked<{ invalidateAndRecompute: jest.Mock }>;
  let billingCustomerRepository: jest.Mocked<{ update: jest.Mock }>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingCreditService,
        {
          provide: BillingService,
          useValue: { isBillingEnabled: jest.fn().mockReturnValue(true) },
        },
        {
          provide: BillingCreditGrantService,
          useValue: {
            createGrant: jest
              .fn()
              .mockResolvedValue({ id: 'grant_1', amountMicro: 2_000_000 }),
            getActiveCreditsMicro: jest.fn().mockResolvedValue(2_000_000),
            hasAnyGrant: jest.fn().mockResolvedValue(true),
            materializeLegacyBalance: jest.fn().mockResolvedValue(undefined),
            revokeGrant: jest.fn().mockResolvedValue({
              grant: {
                id: 'grant_1',
                amountMicro: 2_000_000,
                effectiveAt: PERIOD_START,
                expiresAt: PERIOD_END,
                revokedAt: new Date(),
              },
              wasRevokedNow: true,
            }),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {
            getCurrentBillingSubscription: jest
              .fn()
              .mockResolvedValue(subscription),
          },
        },
        {
          provide: BillingUsageCacheService,
          useValue: {
            getAvailableCredits: jest.fn().mockResolvedValue(undefined),
            adjustAvailableCredits: jest.fn().mockResolvedValue(0),
            invalidateAvailableCredits: jest.fn().mockResolvedValue(undefined),
            hasCounterAdjustmentBeenApplied: jest.fn().mockResolvedValue(false),
            markCounterAdjustmentApplied: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: BillingUsageCapService,
          useValue: {
            clearHasReachedCapForWorkspace: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: CacheLockService,
          useValue: { withLock: jest.fn((fn: () => unknown) => fn()) },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: { update: jest.fn().mockResolvedValue({ affected: 1 }) },
        },
      ],
    }).compile();

    service = module.get<BillingCreditService>(BillingCreditService);
    billingService = module.get(BillingService);
    billingCreditGrantService = module.get(BillingCreditGrantService);
    billingSubscriptionService = module.get(BillingSubscriptionService);
    billingUsageCacheService = module.get(BillingUsageCacheService);
    billingUsageCapService = module.get(BillingUsageCapService);
    cacheLockService = module.get(CacheLockService);
    workspaceCacheService = module.get(WorkspaceCacheService);
    billingCustomerRepository = module.get(
      getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('grantCredits', () => {
    const params = {
      workspaceId,
      amountMicro: 2_000_000,
      type: BillingCreditGrantType.COMPENSATION,
    };

    it('records the grant with the current period end as its expiry', async () => {
      await service.grantCredits(params);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          amountMicro: 2_000_000,
          type: BillingCreditGrantType.COMPENSATION,
          expiresAt: PERIOD_END,
        }),
      );
    });

    it('writes the ledger row and the counter under the workspace credit state lock', async () => {
      await service.grantCredits(params);

      expect(cacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        `billing-credit-state:${workspaceId}`,
      );
      expect(billingCreditGrantService.createGrant).toHaveBeenCalled();
    });

    // Reading the period before waiting for the lock would date the grant to
    // the period the wait started in, so it would land already expired while
    // its amount still went onto the counter for the period now running.
    it('takes its validity window from the period that is current once the lock is held', async () => {
      const NEXT_PERIOD_END = new Date(PERIOD_END.getTime() + 30 * DAY_IN_MS);

      cacheLockService.withLock.mockImplementation(
        async (fn: () => Promise<unknown>) => {
          billingSubscriptionService.getCurrentBillingSubscription.mockResolvedValue(
            {
              ...subscription,
              currentPeriodStart: PERIOD_END,
              currentPeriodEnd: NEXT_PERIOD_END,
            },
          );

          return fn();
        },
      );

      await service.grantCredits(params);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: NEXT_PERIOD_END }),
      );
    });

    it('expires on trial end while the workspace is trialing', async () => {
      const trialEnd = new Date(Date.now() + 5 * DAY_IN_MS);

      billingSubscriptionService.getCurrentBillingSubscription.mockResolvedValue(
        {
          ...subscription,
          status: SubscriptionStatus.Trialing,
          trialStart: PERIOD_START,
          trialEnd,
        },
      );

      await service.grantCredits(params);

      expect(billingCreditGrantService.createGrant).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: trialEnd }),
      );
    });

    it('does not expire on creation when the subscription period has lapsed', async () => {
      const lapsedPeriodEnd = new Date(Date.now() - 60_000);

      billingSubscriptionService.getCurrentBillingSubscription.mockResolvedValue(
        { ...subscription, currentPeriodEnd: lapsedPeriodEnd },
      );

      await service.grantCredits(params);

      const { expiresAt } =
        billingCreditGrantService.createGrant.mock.calls[0][0];

      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('still records the grant when the workspace has no subscription yet', async () => {
      billingSubscriptionService.getCurrentBillingSubscription.mockResolvedValue(
        undefined,
      );

      const grant = await service.grantCredits(params);

      expect(grant).not.toBeNull();
      expect(billingCreditGrantService.createGrant).toHaveBeenCalled();
    });

    it('mirrors the ledger balance onto the billing customer', async () => {
      await service.grantCredits(params);

      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        workspaceId,
        {},
        { creditBalanceMicro: 2_000_000 },
      );
    });

    it('lifts the cap so the no-more-credits banner disappears', async () => {
      await service.grantCredits(params);

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).toHaveBeenCalledWith(workspaceId);
      expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
        workspaceId,
        ['currentBillingSubscription'],
      );
    });

    // An execution can overrun the balance it checked, leaving the counter
    // below zero, and a grant smaller than the overrun does not make the
    // workspace spendable again.
    it('leaves the cap in place when the grant does not bring the counter above zero', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(
        -3_000_000,
      );

      await service.grantCredits(params);

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });

    it('adjusts the warm usage counter instead of flushing it', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(500_000);

      await service.grantCredits(params);

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).toHaveBeenCalledWith(workspaceId, PERIOD_START, 2_000_000);
    });

    it('leaves a cold usage counter cold', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(undefined);

      await service.grantCredits(params);

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    // The first attempt can insert the row and then fail on the refresh, so a
    // replay has to repair the projections rather than assume they are built.
    it('repairs derived state on a replayed grant without moving the counter', async () => {
      billingCreditGrantService.createGrant.mockResolvedValue(null);

      const grant = await service.grantCredits({
        ...params,
        idempotencyKey: 'onboarding-import-contacts:ws_123',
      });

      expect(grant).toBeNull();
      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        workspaceId,
        {},
        { creditBalanceMicro: 2_000_000 },
      );
      expect(
        billingUsageCacheService.invalidateAvailableCredits,
      ).toHaveBeenCalledWith(workspaceId, PERIOD_START);
      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).toHaveBeenCalledWith(workspaceId);
    });

    // A reader that missed the counter before the grant landed would otherwise
    // warm it from a balance predating the grant, and that value would stand
    // until the period ended.
    // A reader can only warm the counter while holding the same lock this
    // write holds, so it cannot be mid-computation, and the next reader to take
    // the lock sees a ledger that already contains this grant.
    it('leaves a cold counter alone rather than seeding it', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(undefined);

      await service.grantCredits(params);

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
      expect(
        billingUsageCacheService.invalidateAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    it('no-ops when billing is disabled', async () => {
      billingService.isBillingEnabled.mockReturnValue(false);

      const grant = await service.grantCredits(params);

      expect(grant).toBeNull();
      expect(billingCreditGrantService.createGrant).not.toHaveBeenCalled();
    });
  });

  describe('revokeGrant', () => {
    it('marks the grant revoked and moves the counter under the workspace credit state lock', async () => {
      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(cacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        `billing-credit-state:${workspaceId}`,
      );
      expect(billingCreditGrantService.revokeGrant).toHaveBeenCalled();
    });

    it('takes the revoked amount back off the warm usage counter', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(3_000_000);
      billingCreditGrantService.getActiveCreditsMicro.mockResolvedValue(0);

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).toHaveBeenCalledWith(workspaceId, PERIOD_START, -2_000_000);
      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        workspaceId,
        {},
        { creditBalanceMicro: 0 },
      );
    });

    // The mutation takes any grant id and a grant can expire between the admin
    // panel rendering and the revoke landing. Those credits were never in the
    // counter, so taking them off would block usage until the period ends.
    it.each([
      [
        'expired',
        {
          effectiveAt: new Date(Date.now() - 40 * DAY_IN_MS),
          expiresAt: new Date(Date.now() - 1 * DAY_IN_MS),
        },
      ],
      [
        'not yet effective',
        {
          effectiveAt: new Date(Date.now() + 1 * DAY_IN_MS),
          expiresAt: new Date(Date.now() + 40 * DAY_IN_MS),
        },
      ],
    ])(
      'leaves the usage counter alone when revoking a grant that was %s',
      async (_label, window) => {
        billingUsageCacheService.getAvailableCredits.mockResolvedValue(
          3_000_000,
        );
        billingCreditGrantService.revokeGrant.mockResolvedValue({
          grant: {
            id: 'grant_1',
            amountMicro: 2_000_000,
            revokedAt: new Date(),
            ...window,
          },
          wasRevokedNow: true,
        });

        await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

        expect(
          billingUsageCacheService.adjustAvailableCredits,
        ).not.toHaveBeenCalled();
      },
    );

    // The attempt that did revoke failed before reaching the counter, so the
    // revoked credits are still spendable and only a rebuild from the ledger
    // can repair that without decrementing a second time.
    it('rebuilds the counter when the first revoke never reached it', async () => {
      billingUsageCacheService.hasCounterAdjustmentBeenApplied.mockResolvedValue(
        false,
      );
      billingCreditGrantService.getActiveCreditsMicro.mockResolvedValue(0);
      billingCreditGrantService.revokeGrant.mockResolvedValue({
        grant: { id: 'grant_1', amountMicro: 2_000_000 },
        wasRevokedNow: false,
      });

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCacheService.invalidateAvailableCredits,
      ).toHaveBeenCalledWith(workspaceId, PERIOD_START);
      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
    });

    it('records that a revocation moved the counter so a retry can tell', async () => {
      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCacheService.markCounterAdjustmentApplied,
      ).toHaveBeenCalledWith(workspaceId, 'revoke:grant_1', PERIOD_END);
    });

    // The first attempt recorded that it moved the counter, so the retry must
    // not move it again and must not rebuild either.
    it('leaves the counter alone when the first revoke already adjusted it', async () => {
      billingUsageCacheService.hasCounterAdjustmentBeenApplied.mockResolvedValue(
        true,
      );
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(3_000_000);
      billingCreditGrantService.getActiveCreditsMicro.mockResolvedValue(0);
      billingCreditGrantService.revokeGrant.mockResolvedValue({
        grant: { id: 'grant_1', amountMicro: 2_000_000 },
        wasRevokedNow: false,
      });

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
      expect(
        billingUsageCacheService.invalidateAvailableCredits,
      ).not.toHaveBeenCalled();
      expect(billingCustomerRepository.update).toHaveBeenCalledWith(
        workspaceId,
        {},
        { creditBalanceMicro: 0 },
      );
      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });

    it('leaves the cap in place when the revoke empties the balance', async () => {
      billingCreditGrantService.getActiveCreditsMicro.mockResolvedValue(0);

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });

    // Taking credits away can never make the workspace spendable again: the
    // grants it leaves behind may already be spent, and the ledger total says
    // nothing about that.
    it('leaves the cap in place even when the revoke leaves other credits behind', async () => {
      billingCreditGrantService.getActiveCreditsMicro.mockResolvedValue(
        500_000,
      );

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });
  });

  describe('refreshWorkspaceCreditState', () => {
    // Stripe redelivers events it already handled. The grants are still live in
    // the ledger, but the workspace may have spent them since, and this replay
    // adds nothing on top.
    it('leaves the cap in place when a replay finds the counter already moved', async () => {
      billingUsageCacheService.hasCounterAdjustmentBeenApplied.mockResolvedValue(
        true,
      );

      await service.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        addsCredits: true,
        isReplay: true,
        adjustmentKey: 'rollover:2026-02-01T00:00:00.000Z',
      });

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });

    // The delivery that wrote the grants never reached the counter, so this one
    // rebuilds it and the credits become spendable here.
    it('lifts the cap when a replay rebuilds the counter', async () => {
      billingUsageCacheService.hasCounterAdjustmentBeenApplied.mockResolvedValue(
        false,
      );

      await service.refreshWorkspaceCreditState({
        workspaceId,
        availableDeltaMicro: 0,
        addsCredits: true,
        isReplay: true,
        adjustmentKey: 'rollover:2026-02-01T00:00:00.000Z',
      });

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).toHaveBeenCalledWith(workspaceId);
    });
  });
});
