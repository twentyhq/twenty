import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationRecurringChargeService } from 'src/engine/core-modules/billing/app-billing/application-recurring-charge.service';
import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-1111-0000-0000-000000000001';
const PERIOD_START = new Date('2026-08-01T00:00:00.000Z');

const buildApplication = (overrides = {}) => ({
  id: APPLICATION_ID,
  name: 'Call Recorder',
  deletedAt: null,
  billing: {
    recurring: {
      platformFee: {
        period: 'MONTH',
        amountMicroCredits: 20_000_000,
        label: 'Platform fee',
      },
      seat: {
        period: 'MONTH',
        amountMicroCredits: 5_000_000,
        per: 'WORKSPACE_MEMBER',
        label: 'Per member',
      },
    },
  },
  ...overrides,
});

describe('ApplicationRecurringChargeService', () => {
  let service: ApplicationRecurringChargeService;

  const billingService = { isBillingEnabled: jest.fn() };
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const usageAnalyticsService = { getChargedRecurringKeys: jest.fn() };
  const workspaceEventEmitter = { emitCustomBatchEvent: jest.fn() };
  const workspaceMemberRepository = { count: jest.fn() };
  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback) => callback()),
    getRepository: jest.fn(async () => workspaceMemberRepository),
  };

  const givenWorkspace = ({
    applications = [buildApplication()],
    interval = SubscriptionInterval.Month,
  } = {}) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      currentBillingSubscription: {
        interval,
        currentPeriodStart: PERIOD_START,
      },
      flatApplicationMaps: {
        byId: Object.fromEntries(
          applications.map((application) => [application.id, application]),
        ),
      },
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    billingService.isBillingEnabled.mockReturnValue(true);
    usageAnalyticsService.getChargedRecurringKeys.mockResolvedValue(new Set());
    workspaceMemberRepository.count.mockResolvedValue(3);
    globalWorkspaceOrmManager.executeInWorkspaceContext.mockImplementation(
      (callback) => callback(),
    );
    globalWorkspaceOrmManager.getRepository.mockResolvedValue(
      workspaceMemberRepository,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRecurringChargeService,
        { provide: BillingService, useValue: billingService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: UsageAnalyticsService, useValue: usageAnalyticsService },
        { provide: WorkspaceEventEmitter, useValue: workspaceEventEmitter },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get(ApplicationRecurringChargeService);
  });

  it('should raise a flat charge once and multiply a per member charge by the member count', async () => {
    givenWorkspace();

    const chargedCount = await service.chargeDueRecurringCharges(WORKSPACE_ID);

    expect(chargedCount).toBe(2);
    expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.APP,
          operationType: UsageOperationType.SUBSCRIPTION,
          creditsUsedMicro: 20_000_000,
          quantity: 1,
          unit: UsageUnit.CREDIT,
          resourceId: APPLICATION_ID,
          resourceContext: 'platformFee',
          userWorkspaceId: null,
          periodStart: PERIOD_START,
        },
        {
          resourceType: UsageResourceType.APP,
          operationType: UsageOperationType.SUBSCRIPTION,
          creditsUsedMicro: 15_000_000,
          quantity: 3,
          unit: UsageUnit.SEAT,
          resourceId: APPLICATION_ID,
          resourceContext: 'seat',
          userWorkspaceId: null,
          periodStart: PERIOD_START,
        },
      ],
      WORKSPACE_ID,
    );
  });

  it('should skip a charge already raised for the period', async () => {
    givenWorkspace();
    usageAnalyticsService.getChargedRecurringKeys.mockResolvedValue(
      new Set([`${APPLICATION_ID}:platformFee`]),
    );

    const chargedCount = await service.chargeDueRecurringCharges(WORKSPACE_ID);

    expect(chargedCount).toBe(1);
    expect(workspaceEventEmitter.emitCustomBatchEvent.mock.calls[0][1]).toEqual(
      [expect.objectContaining({ resourceContext: 'seat' })],
    );
  });

  it('should raise nothing when every charge is already raised', async () => {
    givenWorkspace();
    usageAnalyticsService.getChargedRecurringKeys.mockResolvedValue(
      new Set([`${APPLICATION_ID}:platformFee`, `${APPLICATION_ID}:seat`]),
    );

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('should skip an uninstalled application', async () => {
    givenWorkspace({
      applications: [buildApplication({ deletedAt: new Date() })],
    });

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('should skip an application declaring no recurring charge', async () => {
    givenWorkspace({
      applications: [buildApplication({ billing: { operations: {} } })],
    });

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(
      usageAnalyticsService.getChargedRecurringKeys,
    ).not.toHaveBeenCalled();
  });

  it('should not count members when no charge is per member', async () => {
    givenWorkspace({
      applications: [
        buildApplication({
          billing: {
            recurring: {
              platformFee: {
                period: 'MONTH',
                amountMicroCredits: 20_000_000,
                label: 'Platform fee',
              },
            },
          },
        }),
      ],
    });

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(1);
    expect(workspaceMemberRepository.count).not.toHaveBeenCalled();
  });

  it('should skip a per member charge for a workspace with no members', async () => {
    givenWorkspace({
      applications: [
        buildApplication({
          billing: {
            recurring: {
              seat: {
                period: 'MONTH',
                amountMicroCredits: 5_000_000,
                per: 'WORKSPACE_MEMBER',
                label: 'Per member',
              },
            },
          },
        }),
      ],
    });
    workspaceMemberRepository.count.mockResolvedValue(0);

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('should skip a yearly subscription rather than charge a monthly fee once', async () => {
    givenWorkspace({ interval: SubscriptionInterval.Year });

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('should skip a workspace with no billing subscription', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      currentBillingSubscription: NO_BILLING_SUBSCRIPTION,
      flatApplicationMaps: { byId: {} },
    });

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('should skip everything when billing is disabled', async () => {
    billingService.isBillingEnabled.mockReturnValue(false);

    expect(await service.chargeDueRecurringCharges(WORKSPACE_ID)).toBe(0);
    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });
});
