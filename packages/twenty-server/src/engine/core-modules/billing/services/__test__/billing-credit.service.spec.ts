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
  }>;
  let billingSubscriptionService: jest.Mocked<{
    getCurrentBillingSubscription: jest.Mock;
  }>;
  let billingUsageCacheService: jest.Mocked<{
    getAvailableCredits: jest.Mock;
    adjustAvailableCredits: jest.Mock;
  }>;
  let billingUsageCapService: jest.Mocked<{
    clearHasReachedCapForWorkspace: jest.Mock;
  }>;
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
            materializeLegacyBalance: jest.fn().mockResolvedValue(undefined),
            revokeGrant: jest.fn().mockResolvedValue({
              grant: { id: 'grant_1', amountMicro: 2_000_000 },
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

    it('skips a replayed grant without touching any credit state', async () => {
      billingCreditGrantService.createGrant.mockResolvedValue(null);

      const grant = await service.grantCredits({
        ...params,
        idempotencyKey: 'onboarding-import-contacts:ws_123',
      });

      expect(grant).toBeNull();
      expect(billingCustomerRepository.update).not.toHaveBeenCalled();
      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
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

    it('does not touch the usage counter when the grant was already revoked', async () => {
      billingUsageCacheService.getAvailableCredits.mockResolvedValue(3_000_000);
      billingCreditGrantService.revokeGrant.mockResolvedValue({
        grant: { id: 'grant_1', amountMicro: 2_000_000 },
        wasRevokedNow: false,
      });

      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCacheService.adjustAvailableCredits,
      ).not.toHaveBeenCalled();
      expect(billingCustomerRepository.update).not.toHaveBeenCalled();
    });

    it('does not lift the cap when credits were taken away', async () => {
      await service.revokeGrant({ workspaceId, grantId: 'grant_1' });

      expect(
        billingUsageCapService.clearHasReachedCapForWorkspace,
      ).not.toHaveBeenCalled();
    });
  });
});
