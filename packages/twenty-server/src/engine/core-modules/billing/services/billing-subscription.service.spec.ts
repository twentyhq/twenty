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
          useValue: { findOneByOrFail: jest.fn() },
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

    billingSubscriptionRepository = module.get(
      getRepositoryToken(BillingSubscription),
    );
    billingPriceRepository = module.get(getRepositoryToken(BillingPrice));
  });

  describe('switchToYearlyInterval', () => {
    it('throws when already on yearly interval', async () => {
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
        SubscriptionInterval.Year,
        [licensedItem, meteredItem],
        { plan: BillingPlanKey.PRO },
      );

      (billingSubscriptionRepository.find as jest.Mock).mockResolvedValue([
        sub,
      ]);

      await expect(service.switchToYearlyInterval(sub)).rejects.toMatchObject({
        code: BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE,
      });
    });

    it('updates subscription items with yearly prices when switching from monthly', async () => {
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

      // Return tiers for the current metered monthly price (e.g., up_to = 100 per month)
      (billingPriceRepository.findOneByOrFail as jest.Mock).mockResolvedValue({
        id: meteredItem.stripePriceId,
        tiers: [
          { up_to: 100 }, // monthly cap
          { up_to: null },
        ],
      });

      // Candidate yearly prices: metered with various caps and one licensed yearly
      const yearlyLicensed = buildLicensedYearlyPrice(
        'prod_seats',
        'price_year_licensed',
      );
      const yearlyMeteredBelow = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_1000',
        1000,
      ); // 100*12=1200; pick below 1200
      const yearlyMeteredTooHigh = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_2000',
        2000,
      );
      const yearlyMeteredLower = buildMeteredYearlyPrice(
        'prod_workflow',
        'price_year_metered_600',
        600,
      );

      (billingProductService.getProductPrices as jest.Mock).mockResolvedValue([
        yearlyLicensed,
        yearlyMeteredTooHigh, // should be ignored (>= current yearly cap)
        yearlyMeteredBelow,
        yearlyMeteredLower, // lower but should pick highest below cap => 1000
      ]);

      await service.switchToYearlyInterval(sub);

      expect(
        stripeSubscriptionService.updateSubscriptionItems,
      ).toHaveBeenCalledTimes(1);
      const [calledSubId, items] = (
        stripeSubscriptionService.updateSubscriptionItems as jest.Mock
      ).mock.calls[0];

      expect(calledSubId).toBe(sub.stripeSubscriptionId);

      // Ensure both items got mapped to their yearly counterparts
      const licensedUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_seats',
      );
      const meteredUpdated = (items as BillingSubscriptionItem[]).find(
        (i) => i.stripeProductId === 'prod_workflow',
      );

      expect(licensedUpdated?.stripePriceId).toBe('price_year_licensed');
      expect(meteredUpdated?.stripePriceId).toBe('price_year_metered_1000'); // highest below 1200
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

      await expect(
        service.switchToEnterprisePlan(workspace),
      ).rejects.toMatchObject({
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

      await service.switchToEnterprisePlan(workspace);

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
