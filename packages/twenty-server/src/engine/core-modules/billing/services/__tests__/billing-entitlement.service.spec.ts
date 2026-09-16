/* @license Enterprise */

import { Test } from '@nestjs/testing';

import {
  getWorkspaceAuthContext,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingEntitlementService } from 'src/engine/core-modules/billing/services/billing-entitlement.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageLimitEntitlementProvider } from 'src/engine/core-modules/billing/services/billing-usage-limit-entitlement-provider.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const OTHER_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea420';

describe('BillingEntitlementService', () => {
  let service: BillingEntitlementService;
  let subscriptionService: BillingSubscriptionService;
  let usageLimitProvider: BillingUsageLimitEntitlementProvider;

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
    invalidateAndRecompute: jest.fn(),
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
    workspaceCacheService.invalidateAndRecompute.mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        BillingEntitlementService,
        BillingSubscriptionService,
        BillingUsageLimitEntitlementProvider,
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(BillingEntitlementService);
    subscriptionService = module.get(BillingSubscriptionService);
    usageLimitProvider = module.get(BillingUsageLimitEntitlementProvider);
  });

  const hasUsageLimitEntitlement = (workspaceId = WORKSPACE_ID) =>
    usageLimitProvider.hasIntraWorkspaceLimitEntitlement(workspaceId);

  it('reuses the request snapshot for usage-limit checks and entitlement listing', async () => {
    const authContext = buildSystemAuthContext(WORKSPACE_ID);

    await withWorkspaceAuthContext(authContext, async () => {
      for (let check = 0; check < 100; check++) {
        expect(await hasUsageLimitEntitlement()).toBe(true);
      }
      expect(
        await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID),
      ).toContainEqual({
        key: BillingEntitlementKey.USAGE_LIMIT,
        value: true,
      });
      expect(getWorkspaceAuthContext().billingEntitlements).toEqual({
        [BillingEntitlementKey.USAGE_LIMIT]: true,
      });
    });

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
  });

  it('does not reuse another workspace or another request snapshot', async () => {
    const authContext = buildSystemAuthContext(WORKSPACE_ID);
    workspaceCacheService.getOrRecompute.mockImplementation(
      async (workspaceId: string) => ({
        billingEntitlements: {
          [BillingEntitlementKey.USAGE_LIMIT]: workspaceId === WORKSPACE_ID,
        },
      }),
    );

    await withWorkspaceAuthContext(authContext, async () => {
      expect(await hasUsageLimitEntitlement()).toBe(true);
      expect(await hasUsageLimitEntitlement(OTHER_WORKSPACE_ID)).toBe(false);
      expect(await hasUsageLimitEntitlement()).toBe(true);
    });

    workspaceCacheService.getOrRecompute.mockResolvedValue({
      billingEntitlements: {},
    });
    await withWorkspaceAuthContext(authContext, async () => {
      expect(await hasUsageLimitEntitlement()).toBe(false);
    });

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(3);
  });

  it('uses the workspace cache outside a request', async () => {
    expect(await hasUsageLimitEntitlement()).toBe(true);
    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['billingEntitlements'],
    );
  });

  it('does not keep a failed cache read in the request context', async () => {
    workspaceCacheService.getOrRecompute.mockRejectedValueOnce(
      new Error('cache unavailable'),
    );

    await withWorkspaceAuthContext(
      buildSystemAuthContext(WORKSPACE_ID),
      async () => {
        await expect(hasUsageLimitEntitlement()).rejects.toThrow(
          'cache unavailable',
        );
        expect(await hasUsageLimitEntitlement()).toBe(true);
      },
    );

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(2);
  });

  it('clears the request snapshot when entitlements are invalidated', async () => {
    await withWorkspaceAuthContext(
      buildSystemAuthContext(WORKSPACE_ID),
      async () => {
        expect(await hasUsageLimitEntitlement()).toBe(true);
        workspaceCacheService.getOrRecompute.mockResolvedValue({
          billingEntitlements: {},
        });
        await service.invalidateWorkspaceEntitlements(WORKSPACE_ID);
        expect(await hasUsageLimitEntitlement()).toBe(false);
      },
    );

    expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['billingEntitlements'],
    );
  });

  it('checks license validity again even with Stripe entitlements in context', async () => {
    await withWorkspaceAuthContext(
      buildSystemAuthContext(WORKSPACE_ID),
      async () => {
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
      },
    );

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
  });

  it('does not load Stripe entitlements when billing is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);
    expect(await hasUsageLimitEntitlement()).toBe(true);
    enterprisePlanService.isValid.mockReturnValue(false);
    expect(await hasUsageLimitEntitlement()).toBe(false);
    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });
});
