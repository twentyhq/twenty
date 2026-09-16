/* @license Enterprise */

import { Test } from '@nestjs/testing';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageLimitEntitlementProvider } from 'src/engine/core-modules/billing/services/billing-usage-limit-entitlement-provider.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const OTHER_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea420';

describe('BillingSubscriptionService entitlements', () => {
  let subscriptionService: BillingSubscriptionService;
  let usageLimitProvider: BillingUsageLimitEntitlementProvider;

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };
  const enterprisePlanService = { isValid: jest.fn() };
  const twentyConfigService = { get: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    enterprisePlanService.isValid.mockReturnValue(true);
    twentyConfigService.get.mockReturnValue(true);
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      billingEntitlements: { [BillingEntitlementKey.USAGE_LIMIT]: true },
    });

    const module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        BillingUsageLimitEntitlementProvider,
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    subscriptionService = module.get(BillingSubscriptionService);
    usageLimitProvider = module.get(BillingUsageLimitEntitlementProvider);
  });

  const hasUsageLimitEntitlement = (workspaceId = WORKSPACE_ID) =>
    usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId);

  it('uses cached entitlements for usage limits and entitlement listing without auth context', async () => {
    expect(await hasUsageLimitEntitlement()).toBe(true);
    expect(
      await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID),
    ).toContainEqual({
      key: BillingEntitlementKey.USAGE_LIMIT,
      value: true,
    });
    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['billingEntitlements'],
    );
  });

  it('uses the requested workspace for each entitlement check', async () => {
    workspaceCacheService.getOrRecompute.mockImplementation(
      async (workspaceId: string) => ({
        billingEntitlements: {
          [BillingEntitlementKey.USAGE_LIMIT]: workspaceId === WORKSPACE_ID,
        },
      }),
    );

    expect(await hasUsageLimitEntitlement()).toBe(true);
    expect(await hasUsageLimitEntitlement(OTHER_WORKSPACE_ID)).toBe(false);
    expect(await hasUsageLimitEntitlement()).toBe(true);
  });

  it.each([false, undefined])(
    'does not grant a false or missing entitlement (%s)',
    async (value) => {
      workspaceCacheService.getOrRecompute.mockResolvedValue({
        billingEntitlements: { [BillingEntitlementKey.USAGE_LIMIT]: value },
      });
      expect(await hasUsageLimitEntitlement()).toBe(false);
      expect(
        await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID),
      ).toContainEqual({
        key: BillingEntitlementKey.USAGE_LIMIT,
        value: false,
      });
    },
  );

  it('propagates a failed cache read instead of treating it as a missing entitlement', async () => {
    workspaceCacheService.getOrRecompute.mockRejectedValueOnce(
      new Error('cache unavailable'),
    );
    await expect(hasUsageLimitEntitlement()).rejects.toThrow(
      'cache unavailable',
    );
    expect(await hasUsageLimitEntitlement()).toBe(true);
  });

  it('checks license validity again even when cached Stripe entitlements grant access', async () => {
    expect(await hasUsageLimitEntitlement()).toBe(true);
    enterprisePlanService.isValid.mockReturnValue(false);
    expect(await hasUsageLimitEntitlement()).toBe(false);
    expect(
      await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID),
    ).toEqual(
      Object.values(BillingEntitlementKey).map((key) => ({
        key,
        value: false,
      })),
    );
  });

  it('does not load Stripe entitlements when billing is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);
    expect(await hasUsageLimitEntitlement()).toBe(true);
    expect(
      await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID),
    ).toEqual(
      Object.values(BillingEntitlementKey).map((key) => ({ key, value: true })),
    );
    enterprisePlanService.isValid.mockReturnValue(false);
    expect(await hasUsageLimitEntitlement()).toBe(false);
    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });
});
