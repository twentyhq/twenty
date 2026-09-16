/* @license Enterprise */

import { Test } from '@nestjs/testing';

import {
  withWorkspaceAuthContext,
  getWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceDataSourceService } from 'src/engine/twenty-orm/datasource/workspace-data-source.service';
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
  let workspaceOrmManager: WorkspaceOrmManager;

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
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {},
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
    });

    const module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        WorkspaceOrmManager,
        { provide: WorkspaceDataSourceService, useValue: {} },
        BillingUsageLimitEntitlementProvider,
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: EnterprisePlanService, useValue: enterprisePlanService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    workspaceOrmManager = module.get(WorkspaceOrmManager);
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
  it('shares one load across concurrent checks before ORM, ORM work and nested operations', async () => {
    const authContext = buildSystemAuthContext(WORKSPACE_ID);

    await withWorkspaceAuthContext(authContext, async () => {
      expect(getWorkspaceAuthContext()).toBe(authContext);
      expect(
        await Promise.all(
          Array.from({ length: 100 }, () => hasUsageLimitEntitlement()),
        ),
      ).toEqual(Array(100).fill(true));

      await workspaceOrmManager.executeInWorkspaceContext(async () => {
        const entitlements = getWorkspaceContext().billingEntitlements;

        expect(entitlements[BillingEntitlementKey.USAGE_LIMIT]).toBe(true);
        expect(await hasUsageLimitEntitlement()).toBe(true);
        await subscriptionService.getWorkspaceEntitlements(WORKSPACE_ID);
        await workspaceOrmManager.executeInWorkspaceContext(async () => {
          expect(getWorkspaceContext().billingEntitlements).toBe(entitlements);
          expect(await hasUsageLimitEntitlement()).toBe(true);
        });
      });
    });

    expect(
      workspaceCacheService.getOrRecompute.mock.calls.filter(([, keys]) =>
        keys.includes('billingEntitlements'),
      ),
    ).toHaveLength(1);
    expect(authContext).not.toHaveProperty('billingEntitlements');
  });

  it.each([false, true])(
    'loads once for an ORM job without auth storage (lite: %s)',
    async (lite) => {
      await workspaceOrmManager.executeInWorkspaceContext(
        async () => {
          expect(
            getWorkspaceContext().billingEntitlements[
              BillingEntitlementKey.USAGE_LIMIT
            ],
          ).toBe(true);
          expect(await hasUsageLimitEntitlement()).toBe(true);
          expect(await hasUsageLimitEntitlement()).toBe(true);
        },
        buildSystemAuthContext(WORKSPACE_ID),
        { lite },
      );

      expect(
        workspaceCacheService.getOrRecompute.mock.calls.filter(([, keys]) =>
          keys.includes('billingEntitlements'),
        ),
      ).toHaveLength(1);
    },
  );

  it('isolates nested workspaces and reloads when an auth object starts another request', async () => {
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
      await withWorkspaceAuthContext(
        buildSystemAuthContext(OTHER_WORKSPACE_ID),
        async () => {
          expect(await hasUsageLimitEntitlement(OTHER_WORKSPACE_ID)).toBe(
            false,
          );
          expect(await hasUsageLimitEntitlement(OTHER_WORKSPACE_ID)).toBe(
            false,
          );
        },
      );
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

  it('retries a rejected load within the same shared context', async () => {
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

  it('rechecks the license while reusing the same entitlement snapshot', async () => {
    await withWorkspaceAuthContext(
      buildSystemAuthContext(WORKSPACE_ID),
      async () => {
        expect(await hasUsageLimitEntitlement()).toBe(true);
        enterprisePlanService.isValid.mockReturnValue(false);
        expect(await hasUsageLimitEntitlement()).toBe(false);
      },
    );
    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
  });
});
