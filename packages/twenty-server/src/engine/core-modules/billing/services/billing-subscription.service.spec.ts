import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import type { Repository } from 'typeorm';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';

// Helpers to build test objects with only needed fields
const buildWorkspace = (id: string): Workspace =>
  ({ id }) as unknown as Workspace;

const buildBillingProduct = (
  productKey: BillingProductKey,
  usageType: BillingUsageType,
) => ({
  metadata: {
    productKey,
    priceUsageBased: usageType,
  },
});

const buildSubscriptionItem = (
  productKey: BillingProductKey,
  usageType: BillingUsageType,
  stripeProductId: string,
  stripePriceId: string,
  overrides: Partial<BillingSubscriptionItem> = {},
): BillingSubscriptionItem =>
  ({
    id: 'subItem-' + stripeProductId,
    billingSubscriptionId: 'sub-1',
    stripeSubscriptionId: 'stripe-sub-1',
    metadata: {},
    billingThresholds: null as any,
    billingProduct: buildBillingProduct(productKey, usageType) as any,
    stripeProductId,
    stripePriceId,
    stripeSubscriptionItemId: 'ssi-' + stripeProductId,
    quantity: null,
    hasReachedCurrentPeriodCap: false,
    ...overrides,
  }) as unknown as BillingSubscriptionItem;

const buildSubscription = (
  interval: SubscriptionInterval,
  items: BillingSubscriptionItem[],
  metadata: Record<string, any> = {},
): BillingSubscription =>
  ({
    id: 'sub-1',
    workspaceId: 'ws-1',
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'stripe-sub-1',
    status: SubscriptionStatus.Active,
    interval,
    billingSubscriptionItems: items as any,
    metadata: metadata as any,
  }) as unknown as BillingSubscription;

const buildLicensedYearlyPrice = (
  stripeProductId: string,
  stripePriceId: string,
): BillingPrice =>
  ({
    id: 'price-licensed',
    active: true,
    stripeProductId,
    stripePriceId,
    currency: 'USD',
    taxBehavior: undefined as any,
    type: undefined as any,
    billingScheme: undefined as any,
    currencyOptions: null,
    tiers: null,
    recurring: null,
    transformQuantity: null,
    unitAmountDecimal: null,
    unitAmount: 1000,
    stripeMeterId: null,
    usageType: BillingUsageType.LICENSED,
    interval: SubscriptionInterval.Year,
    metadata: { priceUsageBased: BillingUsageType.LICENSED },
    billingProduct: buildBillingProduct(
      BillingProductKey.BASE_PRODUCT,
      BillingUsageType.LICENSED,
    ) as any,
    billingMeter: null as any,
  }) as unknown as BillingPrice;

const buildMeteredYearlyPrice = (
  stripeProductId: string,
  stripePriceId: string,
  upTo: number,
): BillingPrice =>
  ({
    id: 'price-metered-' + upTo,
    active: true,
    stripeProductId,
    stripePriceId,
    currency: 'USD',
    taxBehavior: undefined as any,
    type: undefined as any,
    billingScheme: undefined as any,
    currencyOptions: null,
    tiers: [
      { up_to: upTo, unit_amount: 1 } as any,
      { up_to: null, unit_amount: 1 } as any,
    ] as any,
    recurring: null,
    transformQuantity: null,
    unitAmountDecimal: null,
    unitAmount: null,
    stripeMeterId: null,
    usageType: BillingUsageType.METERED,
    interval: SubscriptionInterval.Year,
    metadata: { priceUsageBased: BillingUsageType.METERED },
    billingProduct: buildBillingProduct(
      BillingProductKey.WORKFLOW_NODE_EXECUTION,
      BillingUsageType.METERED,
    ) as any,
    billingMeter: null as any,
  }) as unknown as BillingPrice;

describe('BillingSubscriptionService - switching methods', () => {
  let service: BillingSubscriptionService;

  let billingSubscriptionRepository: Partial<Repository<BillingSubscription>>;
  let billingPriceRepository: Partial<Repository<BillingPrice>>;

  let stripeSubscriptionService: StripeSubscriptionService;
  let billingProductService: BillingProductService;
  let stripeSubscriptionScheduleService: StripeSubscriptionScheduleService;

  beforeEach(async () => {
    jest.useFakeTimers();

    // reset mocks
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        {
          provide: StripeSubscriptionService,
          useValue: {
            updateSubscriptionItems: jest.fn(),
            updateSubscription: jest.fn(),
            cancelSubscription: jest.fn(),
            collectLastInvoice: jest.fn(),
            setYearlyThresholds: jest.fn(),
            getBillingThresholdsByInterval: jest.fn(),
          },
        },
        {
          provide: BillingPlanService,
          useValue: { getPlanBaseProduct: jest.fn() },
        },
        {
          provide: BillingProductService,
          useValue: { getProductPrices: jest.fn() },
        },
        {
          provide: StripeCustomerService,
          useValue: { hasPaymentMethod: jest.fn() },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: StripeSubscriptionItemService,
          useValue: { updateSubscriptionItem: jest.fn() },
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn(),
            findOrCreateSubscriptionSchedule: jest.fn(),
            updateSchedule: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingEntitlement),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BillingSubscription),
          useValue: {
            find: jest.fn(),
            delete: jest.fn(),
            findOneOrFail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BillingPrice),
          useValue: { findOneByOrFail: jest.fn(), findOneOrFail: jest.fn() },
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItem),
          useValue: { update: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionService);

    // Retrieve inline mocks from the module for use in tests
    stripeSubscriptionService = module.get(StripeSubscriptionService);

    billingProductService = module.get(BillingProductService);
    stripeSubscriptionScheduleService = module.get(
      StripeSubscriptionScheduleService,
    );

    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscription),
    );
    billingPriceRepository = module.get(getRepositoryToken(BillingPrice));
  });

  describe('toggleInterval', () => {
    it('switches from Month to Year: calls setYearlyThresholds and updates items', async () => {
      const workspace = buildWorkspace('ws-1');
      const licensedItem = buildSubscriptionItem(
        BillingProductKey.BASE_PRODUCT,
        BillingUsageType.LICENSED,
        'prod_seats',
        'price_month_licensed',
        { quantity: 5 },
      );
      const meteredItem = buildSubscriptionItem(
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
        BillingUsageType.METERED,
        'prod_workflow',
        'price_month_metered',
      );
      const sub = buildSubscription(
        SubscriptionInterval.Month,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.PRO },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);

      // Current metered monthly up_to
      (billingPriceRepository.findOneOrFail as jest.Mock).mockResolvedValue({
        interval: SubscriptionInterval.Month,
        tiers: [{ up_to: 100 }, { up_to: null }],
        billingProduct: {
          metadata: { priceUsageBased: BillingUsageType.METERED },
        },
      });

      // Yearly candidates
      const yearlyLicensed = buildLicensedYearlyPrice(
        'prod_seats',
        'price_year_licensed',
      );
      const yearlyMeteredA = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_600',
        600,
      );
      const yearlyMeteredB = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_1000',
        1000,
      ); // choose 1000 (highest under 1200)

      (billingProductService.getProductPrices as jest.Mock).mockResolvedValue([
        yearlyLicensed,
        yearlyMeteredA,
        yearlyMeteredB,
      ]);

      await service.changeInterval(workspace);

      expect(
        stripeSubscriptionService.setYearlyThresholds,
      ).toHaveBeenCalledWith(sub.stripeSubscriptionId);
      expect(
        stripeSubscriptionService.updateSubscriptionItems,
      ).toHaveBeenCalledTimes(1);

      const [calledSubId, items] = (
        stripeSubscriptionService.updateSubscriptionItems as jest.Mock
      ).mock.calls[0];

      expect(calledSubId).toBe(sub.stripeSubscriptionId);

      // Updated items
      const licensedUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_seats',
      );

      const meteredUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_workflow',
      );

      expect(licensedUpdated?.stripePriceId).toBe('price_year_licensed');

      expect(meteredUpdated?.stripePriceId).toBe('price_year_metered_1000');
    });

    it('switches from Year to Month: updates schedule phases correctly', async () => {
      const workspace = buildWorkspace('ws-1');
      const licensedItem = buildSubscriptionItem(
        BillingProductKey.BASE_PRODUCT,
        BillingUsageType.LICENSED,
        'prod_seats',
        'price_year_licensed',
        { quantity: 3 },
      );
      const meteredItem = buildSubscriptionItem(
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
        BillingUsageType.METERED,
        'prod_workflow',
        'price_year_metered',
      );
      const sub = buildSubscription(
        SubscriptionInterval.Year,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.PRO },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);

      // Current metered yearly up_to 1200 => monthly referenceCap = 100
      (billingPriceRepository.findOneOrFail as jest.Mock).mockResolvedValue({
        interval: SubscriptionInterval.Year,
        tiers: [{ up_to: 1200 }, { up_to: null }],
        billingProduct: {
          metadata: { priceUsageBased: BillingUsageType.METERED },
        },
      });

      // Monthly candidates: choose highest <= 100
      const monthlyLicensed: BillingPrice = {
        ...(buildLicensedYearlyPrice(
          'prod_seats',
          'price_month_licensed',
        ) as any),
        interval: SubscriptionInterval.Month,
        stripePriceId: 'price_month_licensed',
        metadata: { priceUsageBased: BillingUsageType.LICENSED },
      } as any;
      const monthlyMetered50: BillingPrice = {
        ...(buildMeteredYearlyPrice(
          'prod_workflow',
          'price_month_metered_50',
          50,
        ) as any),
        interval: SubscriptionInterval.Month,
        metadata: { priceUsageBased: BillingUsageType.METERED },
      } as any;
      const monthlyMetered100: BillingPrice = {
        ...(buildMeteredYearlyPrice(
          'prod_workflow',
          'price_month_metered_100',
          100,
        ) as any),
        interval: SubscriptionInterval.Month,
        metadata: { priceUsageBased: BillingUsageType.METERED },
      } as any;

      (billingProductService.getProductPrices as jest.Mock).mockResolvedValue([
        monthlyLicensed,
        monthlyMetered50,
        monthlyMetered100,
      ]);

      // Schedule mocks
      (
        stripeSubscriptionScheduleService.getSubscriptionWithSchedule as jest.Mock
      ).mockResolvedValue({
        id: sub.stripeSubscriptionId,
        current_period_end: 1700000000,
      });
      (
        stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule as jest.Mock
      ).mockResolvedValue({
        id: 'schedule_1',
        phases: [
          {
            start_date: 1600000000,
            end_date: 1650000000,
            items: [
              { price: 'old_licensed', quantity: 2 },
              { price: { id: 'old_metered' } },
            ],
          },
        ],
      });

      (
        stripeSubscriptionService.getBillingThresholdsByInterval as jest.Mock
      ).mockReturnValue({
        amount_gte: 1000,
        reset_billing_cycle_anchor: false,
      });

      await service.changeInterval(workspace);

      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledTimes(1);

      const [scheduleId, payload] = (
        stripeSubscriptionScheduleService.updateSchedule as jest.Mock
      ).mock.calls[0];

      expect(scheduleId).toBe('schedule_1');

      const phases = (payload as any).phases;

      expect(phases).toHaveLength(2);

      const currentPhase = phases[0];

      expect(currentPhase).toEqual({
        start_date: 1600000000,
        end_date: 1650000000,
        items: [
          { price: 'old_licensed', quantity: 2 },
          { price: 'old_metered' },
        ],
      });

      const nextPhase = phases[1];

      expect(nextPhase.items).toEqual([
        { price: 'price_month_licensed', quantity: 3 },
        { price: 'price_month_metered_100' },
      ]);
      expect(nextPhase.start_date).toBe(1650000000);
      expect(nextPhase.proration_behavior).toBe('none');
      expect(nextPhase.billing_thresholds).toEqual({
        amount_gte: 1000,
        reset_billing_cycle_anchor: false,
      });
    });
  });

  describe('switchPlan', () => {
    it('switches from PRO to ENTERPRISE: updates schedule phases correctly', async () => {
      const workspace = buildWorkspace('ws-1');
      const licensedItem = buildSubscriptionItem(
        BillingProductKey.BASE_PRODUCT,
        BillingUsageType.LICENSED,
        'prod_seats',
        'price_month_licensed',
        { quantity: 4 },
      );
      const meteredItem = buildSubscriptionItem(
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
        BillingUsageType.METERED,
        'prod_workflow',
        'price_month_metered',
      );
      const sub = buildSubscription(
        SubscriptionInterval.Month,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.PRO },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);

      // Current metered monthly up_to 100
      (billingPriceRepository.findOneOrFail as jest.Mock).mockResolvedValue({
        interval: SubscriptionInterval.Month,
        tiers: [{ up_to: 100 }, { up_to: null }],
        billingProduct: {
          metadata: { priceUsageBased: BillingUsageType.METERED },
        },
      });

      // ENTERPRISE plan candidates at same interval (Month)
      const entLicensed: BillingPrice = {
        ...(buildLicensedYearlyPrice(
          'prod_seats',
          'price_ent_licensed',
        ) as any),
        interval: SubscriptionInterval.Month,
        stripePriceId: 'price_ent_licensed',
        metadata: { priceUsageBased: BillingUsageType.LICENSED },
        billingProduct: buildBillingProduct(
          BillingProductKey.BASE_PRODUCT,
          BillingUsageType.LICENSED,
        ) as any,
      } as any;

      const entMetered: BillingPrice = {
        ...(buildMeteredYearlyPrice(
          'prod_workflow',
          'price_ent_metered_100',
          100,
        ) as any),
        interval: SubscriptionInterval.Month,
        metadata: { priceUsageBased: BillingUsageType.METERED },
        billingProduct: buildBillingProduct(
          BillingProductKey.WORKFLOW_NODE_EXECUTION,
          BillingUsageType.METERED,
        ) as any,
      } as any;

      (billingProductService.getProductPrices as jest.Mock).mockResolvedValue([
        entLicensed,
        entMetered,
      ]);

      // Schedule mocks
      (
        stripeSubscriptionScheduleService.getSubscriptionWithSchedule as jest.Mock
      ).mockResolvedValue({
        id: sub.stripeSubscriptionId,
        current_period_end: 1800000000,
      });
      (
        stripeSubscriptionScheduleService.findOrCreateSubscriptionSchedule as jest.Mock
      ).mockResolvedValue({
        id: 'schedule_2',
        phases: [
          {
            start_date: 1700000000,
            end_date: 1750000000,
            items: [
              { price: 'old_licensed', quantity: 1 },
              { price: { id: 'old_metered' } },
            ],
          },
        ],
      });

      (
        stripeSubscriptionService.getBillingThresholdsByInterval as jest.Mock
      ).mockReturnValue({
        amount_gte: 2000,
        reset_billing_cycle_anchor: false,
      });

      await service.changePlan(workspace);

      expect(
        stripeSubscriptionScheduleService.updateSchedule,
      ).toHaveBeenCalledTimes(1);

      const [scheduleId, payload] = (
        stripeSubscriptionScheduleService.updateSchedule as jest.Mock
      ).mock.calls[0];

      expect(scheduleId).toBe('schedule_2');

      const phases = (payload as any).phases;

      expect(phases).toHaveLength(2);

      const currentPhase = phases[0];

      expect(currentPhase).toEqual({
        start_date: 1700000000,
        end_date: 1750000000,
        items: [
          { price: 'old_licensed', quantity: 1 },
          { price: 'old_metered' },
        ],
      });

      const nextPhase = phases[1];

      expect(nextPhase.items).toEqual([
        { price: 'price_ent_licensed', quantity: 4 },
        { price: 'price_ent_metered_100' },
      ]);
      expect(nextPhase.start_date).toBe(1750000000);
      expect(nextPhase.proration_behavior).toBe('none');
      expect(nextPhase.billing_thresholds).toEqual({
        amount_gte: 2000,
        reset_billing_cycle_anchor: false,
      });
    });
  });

  describe('switchToEnterprisePlan', () => {
    it('throws when already on ENTERPRISE plan', async () => {
      const workspace = buildWorkspace('ws-1');
      const licensedItem = buildSubscriptionItem(
        BillingProductKey.BASE_PRODUCT,
        BillingUsageType.LICENSED,
        'prod_seats',
        'price_month_licensed',
      );
      const meteredItem = buildSubscriptionItem(
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
        BillingUsageType.METERED,
        'prod_workflow',
        'price_month_metered',
      );
      const sub = buildSubscription(
        SubscriptionInterval.Month,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.ENTERPRISE },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);

      await expect(service.changePlan(workspace)).rejects.toMatchObject({
        code: BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE,
      });
    });

    it('updates items and subscription metadata when switching to ENTERPRISE', async () => {
      const workspace = buildWorkspace('ws-1');
      const licensedItem = buildSubscriptionItem(
        BillingProductKey.BASE_PRODUCT,
        BillingUsageType.LICENSED,
        'prod_seats',
        'price_month_licensed',
      );
      const meteredItem = buildSubscriptionItem(
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
        BillingUsageType.METERED,
        'prod_workflow',
        'price_month_metered',
      );
      const sub = buildSubscription(
        SubscriptionInterval.Month,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.PRO },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);
      (billingPriceRepository.findOneByOrFail as jest.Mock).mockResolvedValue({
        id: meteredItem.stripePriceId,
        tiers: [{ up_to: 50 }, { up_to: null }],
      });

      const yearlyLicensed = buildLicensedYearlyPrice(
        'prod_seats',
        'price_year_licensed_ent',
      );
      const yearlyMetered = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_300',
        300,
      ); // 50*12=600; pick below 600

      (billingProductService.getProductPrices as jest.Mock).mockResolvedValue([
        yearlyLicensed,
        yearlyMetered,
      ]);

      await service.changePlan(workspace);

      expect(
        stripeSubscriptionService.updateSubscriptionItems,
      ).toHaveBeenCalledTimes(1);
      const [calledSubId, items] = (
        stripeSubscriptionService.updateSubscriptionItems as jest.Mock
      ).mock.calls[0];

      expect(calledSubId).toBe(sub.stripeSubscriptionId);

      const licensedUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_seats',
      );
      const meteredUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_workflow',
      );

      expect(licensedUpdated?.stripePriceId).toBe('price_year_licensed_ent');
      expect(meteredUpdated?.stripePriceId).toBe('price_year_metered_300');

      expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalledWith(
        sub.stripeSubscriptionId,
        { metadata: { ...sub.metadata, plan: BillingPlanKey.ENTERPRISE } },
      );
    });
  });
});
