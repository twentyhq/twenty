/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectLiteral, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { BillingSubscriptionService } from './billing-subscription.service';

// Minimal fixtures
function mkWorkspace(): Workspace {
  return { id: 'ws_1' } as Workspace;
}

function mkLicensedPrice(overrides: Partial<BillingPrice> = {}): BillingPrice {
  return {
    id: 'price_db_licensed',
    stripePriceId: 'price_licensed_m',
    interval: SubscriptionInterval.Month,
    active: true,
    billingProduct: {
      metadata: {
        productKey: BillingProductKey.BASE_PRODUCT,
        planKey: BillingPlanKey.PRO,
        priceUsageBased: BillingUsageType.LICENSED,
      },
    } as any,
    tiers: [] as any,
    ...overrides,
  } as BillingPrice;
}

function mkMeteredPrice(overrides: Partial<BillingPrice> = {}): BillingPrice {
  return {
    id: 'price_db_metered',
    stripePriceId: 'price_metered_m_1000',
    interval: SubscriptionInterval.Month,
    active: true,
    billingProduct: {
      metadata: {
        productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
        planKey: BillingPlanKey.PRO,
        priceUsageBased: BillingUsageType.METERED,
      },
    } as any,
    tiers: [
      { up_to: 1000, unit_amount_decimal: '0' },
      { up_to: null, unit_amount_decimal: '5' },
    ] as any,
    ...overrides,
  } as BillingPrice;
}

function mkSubscriptionEntity(
  overrides: Partial<BillingSubscription> = {},
): BillingSubscription {
  return {
    id: 'sub_db_1',
    workspaceId: 'ws_1',
    stripeSubscriptionId: 'sub_1',
    status: SubscriptionStatus.Active,
    interval: SubscriptionInterval.Month,
    billingSubscriptionItems: [
      {
        stripeSubscriptionItemId: 'si_licensed',
        stripeProductId: 'prod_base',
        stripePriceId: 'price_licensed_m',
        quantity: 7,
        billingProduct: {
          metadata: {
            productKey: BillingProductKey.BASE_PRODUCT,
            planKey: BillingPlanKey.PRO,
            priceUsageBased: BillingUsageType.LICENSED,
          },
        } as any,
      } as BillingSubscriptionItem,
      {
        stripeSubscriptionItemId: 'si_metered',
        stripeProductId: 'prod_metered',
        stripePriceId: 'price_metered_m_1000',
        billingProduct: {
          metadata: {
            productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            planKey: BillingPlanKey.PRO,
            priceUsageBased: BillingUsageType.METERED,
          },
        } as any,
      } as BillingSubscriptionItem,
    ],
    ...overrides,
  } as BillingSubscription;
}

function mkStripeSchedulePhase(
  items: Array<{ price: string; quantity?: number }>,
  start: number,
  end?: number,
): Stripe.SubscriptionSchedule.Phase {
  return {
    start_date: start,
    end_date: end,
    items: items.map((i) => ({ price: i.price, quantity: i.quantity })),
  } as any;
}

function mkScheduleWithEditable(phases: {
  current: Stripe.SubscriptionSchedule.Phase;
  next?: Stripe.SubscriptionSchedule.Phase;
}) {
  return {
    id: 'ssch_1',
    phases: [phases.current, ...(phases.next ? [phases.next] : [])],
  } as unknown as Stripe.SubscriptionSchedule;
}

// Mocks factory
function repoMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    findOneOrFail: jest.fn(),
    findOneByOrFail: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('BillingSubscriptionService', () => {
  let module: TestingModule;
  let service: BillingSubscriptionService;

  // DB repos
  let entitlementRepo: jest.Mocked<Repository<BillingEntitlement>>;
  let subscriptionRepo: jest.Mocked<Repository<BillingSubscription>>;
  let priceRepo: jest.Mocked<Repository<BillingPrice>>;
  let itemRepo: jest.Mocked<Repository<BillingSubscriptionItem>>;
  let customerRepo: jest.Mocked<Repository<BillingCustomer>>;

  // External services (Stripe* + plan/product/phase)
  let stripeSubSvc: jest.Mocked<StripeSubscriptionService>;
  let stripeSchedSvc: jest.Mocked<StripeSubscriptionScheduleService>;
  let stripeItemSvc: jest.Mocked<StripeSubscriptionItemService>;
  let stripeCustomerSvc: jest.Mocked<StripeCustomerService>;
  let planSvc: jest.Mocked<BillingPlanService>;
  let productSvc: jest.Mocked<BillingProductService>;
  let phaseSvc: jest.Mocked<BillingSubscriptionPhaseService>;
  let configSvc: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    entitlementRepo = repoMock<BillingEntitlement>();
    subscriptionRepo = repoMock<BillingSubscription>();
    priceRepo = repoMock<BillingPrice>();
    itemRepo = repoMock<BillingSubscriptionItem>();
    customerRepo = repoMock<BillingCustomer>();

    stripeSubSvc = {
      updateSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
      collectLastInvoice: jest.fn(),
      getBillingThresholdsByInterval: jest.fn().mockResolvedValue({
        amount_gte: 1000,
        reset_billing_cycle_anchor: false,
      }),
    } as any;

    stripeSchedSvc = {
      getSubscriptionWithSchedule: jest.fn(),
      findOrCreateSubscriptionSchedule: jest.fn(),
      getEditablePhases: jest.fn(),
      replaceEditablePhases: jest.fn(),
    } as any;

    stripeItemSvc = {} as any;
    stripeCustomerSvc = { hasPaymentMethod: jest.fn() } as any;

    planSvc = {
      getPlanBaseProduct: jest.fn(),
      listPlans: jest.fn(),
      getPlanByPriceId: jest.fn(),
      getPricesPerPlanByInterval: jest.fn(),
    } as any;

    productSvc = {
      getProductPrices: jest.fn(),
    } as any;

    phaseSvc = {
      getDetailsFromPhase: jest.fn(),
      toSnapshot: jest.fn(),
      buildSnapshot: jest.fn(),
      getLicensedPriceIdFromSnapshot: jest.fn(),
      isSamePhaseSignature: jest.fn(),
    } as any;

    configSvc = { get: jest.fn().mockReturnValue(0) } as any;

    module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        { provide: BillingPlanService, useValue: planSvc },
        { provide: BillingProductService, useValue: productSvc },
        { provide: StripeCustomerService, useValue: stripeCustomerSvc },
        { provide: StripeSubscriptionItemService, useValue: stripeItemSvc },
        { provide: StripeSubscriptionService, useValue: stripeSubSvc },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: stripeSchedSvc,
        },
        { provide: BillingSubscriptionPhaseService, useValue: phaseSvc },
        { provide: TwentyConfigService, useValue: configSvc },
        {
          provide: getRepositoryToken(BillingEntitlement),
          useValue: entitlementRepo,
        },
        {
          provide: getRepositoryToken(BillingSubscription),
          useValue: subscriptionRepo,
        },
        { provide: getRepositoryToken(BillingPrice), useValue: priceRepo },
        {
          provide: getRepositoryToken(BillingSubscriptionItem),
          useValue: itemRepo,
        },
        {
          provide: getRepositoryToken(BillingCustomer),
          useValue: customerRepo,
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionService);
  });

  // Common arrangements
  function arrangeScheduleWithCurrentAndNext() {
    const now = Math.floor(Date.now() / 1000);
    const currentPhase = mkStripeSchedulePhase(
      [
        { price: 'price_licensed_m', quantity: 7 },
        { price: 'price_metered_m_1000' },
      ],
      now - 1000,
      now + 1000,
    );
    const nextPhase = mkStripeSchedulePhase(
      [
        { price: 'price_licensed_m', quantity: 7 },
        { price: 'price_metered_m_1000' },
      ],
      now + 1000,
    );

    const schedule = mkScheduleWithEditable({
      current: currentPhase,
      next: nextPhase,
    });

    // Always return plain SubscriptionWithSchedule (no event/data wrapper)
    stripeSchedSvc.getSubscriptionWithSchedule.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
      customer: 'cus_1',
      currency: 'usd',
      collection_method: 'charge_automatically',
      automatic_tax: null as any,
      cancellation_details: null as any,
      cancel_at_period_end: false,
      canceled_at: null as any,
      cancel_at: null as any,
      ended_at: null as any,
      trial_start: null as any,
      trial_end: null as any,
      current_period_start: now - 1000,
      current_period_end: now + 1000,
      metadata: {},
      items: {
        data: [
          {
            id: 'si_licensed',
            plan: { interval: 'month' } as any,
            price: { id: 'price_licensed_m', product: 'prod_base' } as any,
          } as any,
          {
            id: 'si_metered',
            plan: { interval: 'month' } as any,
            price: {
              id: 'price_metered_m_1000',
              product: 'prod_metered',
            } as any,
          } as any,
        ],
      } as any,
      schedule: {
        id: schedule.id,
        phases: [
          {
            start_date: currentPhase.start_date,
            end_date: currentPhase.end_date,
            items: currentPhase.items,
          },
          {
            start_date: nextPhase.start_date,
            end_date: nextPhase.end_date,
            items: nextPhase.items,
          },
        ],
      } as any,
    } as any);
    stripeSchedSvc.findOrCreateSubscriptionSchedule.mockResolvedValue(schedule);
    stripeSchedSvc.getEditablePhases.mockReturnValue({
      currentEditable: currentPhase,
      nextEditable: nextPhase,
    });

    phaseSvc.toSnapshot.mockImplementation((p: any) => ({
      start_date: p.start_date,
      end_date: p.end_date,
      items: p.items,
      proration_behavior: 'none',
    }));
    phaseSvc.getLicensedPriceIdFromSnapshot.mockImplementation((snap: any) => {
      const items: Array<{ price: string; quantity?: number }> =
        (snap && snap.items) || [];
      const licensed = items.find((it) => typeof it.quantity === 'number');

      return licensed?.price ?? 'price_licensed_m';
    });
    // Provide a concrete Subscription for paths that call updateSubscription
    stripeSubSvc.updateSubscription.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
      customer: 'cus_1',
      currency: 'usd',
      collection_method: 'charge_automatically',
      automatic_tax: null as any,
      cancellation_details: null as any,
      cancel_at_period_end: false,
      canceled_at: null as any,
      cancel_at: null as any,
      ended_at: null as any,
      trial_start: null as any,
      trial_end: null as any,
      current_period_start: now - 1000,
      current_period_end: now + 1000,
      metadata: {},
      items: {
        data: [
          {
            id: 'si_licensed',
            plan: { interval: 'month' } as any,
            price: { id: 'price_licensed_m', product: 'prod_base' } as any,
          } as any,
          {
            id: 'si_metered',
            plan: { interval: 'month' } as any,
            price: {
              id: 'price_metered_m_1000',
              product: 'prod_metered',
            } as any,
          } as any,
        ],
      } as any,
      // schedule is an id string here to exercise the re-fetch branch
      schedule: schedule.id as any,
    } as any);

    return { currentPhase, nextPhase };
  }

  function arrangeCurrentDetails() {
    const metered = mkMeteredPrice({
      stripePriceId: 'price_metered_m_1000',
      interval: SubscriptionInterval.Month,
    });
    const licensed = mkLicensedPrice();

    phaseSvc.getDetailsFromPhase.mockResolvedValue({
      plan: {
        planKey: BillingPlanKey.PRO,
        meteredProducts: [],
        licensedProducts: [],
      },
      meteredPrice: metered as any,
      licensedPrice: licensed as any,
      quantity: 7,
      interval: SubscriptionInterval.Month,
    });

    return { metered, licensed };
  }

  function arrangePlanMapping() {
    // Build catalogs per interval
    const licensedMonth = mkLicensedPrice({
      stripePriceId: 'price_licensed_m',
      interval: SubscriptionInterval.Month,
    });
    const licensedYear = mkLicensedPrice({
      stripePriceId: 'price_licensed_y',
      interval: SubscriptionInterval.Year,
    });

    const meteredMonth1k = mkMeteredPrice({
      stripePriceId: 'price_metered_m_1000',
      interval: SubscriptionInterval.Month,
      tiers: [
        { up_to: 1000, unit_amount_decimal: '0' },
        { up_to: null, unit_amount_decimal: '5' },
      ] as any,
    });
    const meteredMonth5k = mkMeteredPrice({
      stripePriceId: 'price_metered_m_5000',
      interval: SubscriptionInterval.Month,
      tiers: [
        { up_to: 5000, unit_amount_decimal: '0' },
        { up_to: null, unit_amount_decimal: '5' },
      ] as any,
    });

    const meteredYear12k = mkMeteredPrice({
      stripePriceId: 'price_metered_y_12000',
      interval: SubscriptionInterval.Year,
      tiers: [
        { up_to: 12000, unit_amount_decimal: '0' },
        { up_to: null, unit_amount_decimal: '5' },
      ] as any,
    });
    const meteredYear24k = mkMeteredPrice({
      stripePriceId: 'price_metered_y_24000',
      interval: SubscriptionInterval.Year,
      tiers: [
        { up_to: 24000, unit_amount_decimal: '0' },
        { up_to: null, unit_amount_decimal: '5' },
      ] as any,
    });

    const byId: Record<string, BillingPrice> = {
      [licensedMonth.stripePriceId]: licensedMonth,
      [licensedYear.stripePriceId]: licensedYear,
      [meteredMonth1k.stripePriceId]: meteredMonth1k,
      [meteredMonth5k.stripePriceId]: meteredMonth5k,
      [meteredYear12k.stripePriceId]: meteredYear12k,
      [meteredYear24k.stripePriceId]: meteredYear24k,
    };

    (productSvc.getProductPrices as jest.Mock).mockImplementation(
      ({ interval }: { interval: SubscriptionInterval }) => {
        if (interval === SubscriptionInterval.Month) {
          return Promise.resolve([
            licensedMonth,
            meteredMonth1k,
            meteredMonth5k,
          ]);
        }
        if (interval === SubscriptionInterval.Year) {
          return Promise.resolve([
            licensedYear,
            meteredYear12k,
            meteredYear24k,
          ]);
        }

        return Promise.resolve([]);
      },
    );

    priceRepo.findOneOrFail.mockImplementation(async ({ where }: any) => {
      const id = where?.stripePriceId;
      const hit = byId[id];

      if (!hit) throw new Error('unknown price id ' + id);

      return hit;
    });

    priceRepo.findOneByOrFail.mockImplementation(
      async ({ stripePriceId }: any) => {
        const hit = byId[stripePriceId];

        if (!hit) throw new Error('unknown price id ' + stripePriceId);

        return hit;
      },
    );

    priceRepo.findOneBy.mockImplementation(
      async ({ stripePriceId }: any) => byId[stripePriceId] ?? null,
    );
    priceRepo.findOne.mockImplementation(
      async ({ where }: any) => byId[where?.stripePriceId] ?? null,
    );
  }

  function arrangeGetCurrentSubEntity() {
    const entity = mkSubscriptionEntity();

    subscriptionRepo.find.mockResolvedValue([entity]);
    subscriptionRepo.findOneOrFail.mockResolvedValue(entity);
    subscriptionRepo.findOne.mockResolvedValue(entity);

    return entity;
  }

  describe('changeMeteredPrice', () => {
    it('replaces schedule phases and syncs subscription', async () => {
      const ws = mkWorkspace();

      arrangeGetCurrentSubEntity();
      arrangeScheduleWithCurrentAndNext();
      arrangeCurrentDetails();
      arrangePlanMapping();

      // After replace, schedule is read again and sync writes to DB
      stripeSchedSvc.replaceEditablePhases.mockResolvedValue(undefined as any);
      subscriptionRepo.find.mockResolvedValue([mkSubscriptionEntity()]);

      await service.changeMeteredPrice(ws, 'price_metered_m_1000');

      expect(stripeSchedSvc.replaceEditablePhases).toHaveBeenCalledTimes(1);
      expect(subscriptionRepo.upsert).toHaveBeenCalled();
      expect(itemRepo.upsert).toHaveBeenCalled();
    });
  });

  describe('cancelSwitchMeteredPrice', () => {
    it('maps to current metered price and calls changeMeteredPrice', async () => {
      const ws = mkWorkspace();

      arrangeScheduleWithCurrentAndNext();
      arrangeGetCurrentSubEntity();
      const { metered } = arrangeCurrentDetails();

      const spy = jest.spyOn(service as any, 'changeMeteredPrice');

      (service as any).changeMeteredPrice = spy.mockResolvedValue(undefined);

      await service.cancelSwitchMeteredPrice(ws);

      expect(spy).toHaveBeenCalledWith(ws, metered.stripePriceId);
    });
  });

  describe('changeInterval', () => {
    it('performs immediate Month -> Year upgrade via Stripe update', async () => {
      const ws = mkWorkspace();

      arrangeGetCurrentSubEntity();
      arrangeScheduleWithCurrentAndNext();
      arrangeCurrentDetails();
      arrangePlanMapping();

      await service.changeInterval(ws);

      expect(stripeSubSvc.updateSubscription).toHaveBeenCalled();
    });
  });

  describe('changePlan', () => {
    it('performs PRO -> ENTERPRISE immediate upgrade via Stripe update', async () => {
      arrangeGetCurrentSubEntity();
      arrangeScheduleWithCurrentAndNext();
      arrangeCurrentDetails();
      arrangePlanMapping();

      await service.changePlan(mkWorkspace());

      expect(stripeSubSvc.updateSubscription).toHaveBeenCalled();
    });
  });

  describe('cancelSwitchPlan', () => {
    it('cancels switch by targeting ENTERPRISE and updates Stripe', async () => {
      arrangeGetCurrentSubEntity();
      arrangeScheduleWithCurrentAndNext();
      arrangeCurrentDetails();
      arrangePlanMapping();

      await service.cancelSwitchPlan(mkWorkspace());

      expect(stripeSubSvc.updateSubscription).toHaveBeenCalled();
    });
  });

  describe('cancelSwitchInterval', () => {
    it('cancels interval switch by targeting Year and updates Stripe', async () => {
      arrangeGetCurrentSubEntity();
      arrangeScheduleWithCurrentAndNext();
      arrangeCurrentDetails();
      arrangePlanMapping();

      await service.cancelSwitchInterval(mkWorkspace());

      expect(stripeSubSvc.updateSubscription).toHaveBeenCalled();
    });
  });

  describe('metered price mapping helpers', () => {
    function mkMeteredWith(
      id: string,
      cap: number | null,
      interval: SubscriptionInterval,
    ): BillingPrice {
      return mkMeteredPrice({
        stripePriceId: id,
        interval,
        tiers: [
          { up_to: cap === null ? 0 : cap, unit_amount_decimal: '0' },
          { up_to: null, unit_amount_decimal: '5' },
        ] as any,
      });
    }

    it('findMeteredMatchingPriceForIntervalSwitching picks floor on target interval with cap scaling', async () => {
      // reference price: Month cap 1000 → scales to 12000 on Year
      const refId = 'price_ref_m_1000';

      priceRepo.findOneOrFail.mockImplementation(async ({ where }: any) => {
        if (where?.stripePriceId === refId) {
          return mkMeteredWith(refId, 1000, SubscriptionInterval.Month);
        }
        throw new Error('unexpected id ' + where?.stripePriceId);
      });

      const catalog: BillingPrice[] = [
        mkMeteredWith('price_year_6000', 6000, SubscriptionInterval.Year),
        mkMeteredWith('price_year_12000', 12000, SubscriptionInterval.Year),
        mkMeteredWith('price_year_24000', 24000, SubscriptionInterval.Year),
      ];

      const mapped = await service.findMeteredMatchingPriceForIntervalSwitching(
        {
          billingPricesPerPlanAndIntervalArray: catalog,
          meteredPriceId: refId,
          targetInterval: SubscriptionInterval.Year,
        },
      );

      expect(mapped.stripePriceId).toBe('price_year_12000');
    });

    it('findMeteredMatchingPriceForPlanSwitching picks floor on same interval', async () => {
      // reference price: Month cap 5000
      const refId = 'price_ref_m_5000';

      priceRepo.findOneOrFail.mockImplementation(async ({ where }: any) => {
        if (where?.stripePriceId === refId) {
          return mkMeteredWith(refId, 5000, SubscriptionInterval.Month);
        }
        throw new Error('unexpected id ' + where?.stripePriceId);
      });

      const catalog: BillingPrice[] = [
        mkMeteredWith('price_month_1000', 1000, SubscriptionInterval.Month),
        mkMeteredWith('price_month_5000', 5000, SubscriptionInterval.Month),
        mkMeteredWith('price_month_10000', 10000, SubscriptionInterval.Month),
      ];

      const mapped = await service.findMeteredMatchingPriceForPlanSwitching({
        billingPricesPerPlanAndIntervalArray: catalog,
        meteredPriceId: refId,
      });

      expect(mapped.stripePriceId).toBe('price_month_5000');
    });

    it('findMeteredMatchingPriceForMeteredPriceSwitching scales cap then picks floor', async () => {
      // reference price: Month cap 2000 → scales to 24000 on Year
      const targetId = 'price_target_m_2000';

      priceRepo.findOneOrFail.mockImplementation(async ({ where }: any) => {
        if (where?.stripePriceId === targetId) {
          return mkMeteredWith(targetId, 2000, SubscriptionInterval.Month);
        }
        throw new Error('unexpected id ' + where?.stripePriceId);
      });

      const catalog: BillingPrice[] = [
        mkMeteredWith('price_year_12000', 12000, SubscriptionInterval.Year),
        mkMeteredWith('price_year_24000', 24000, SubscriptionInterval.Year),
      ];

      const mapped =
        await service.findMeteredMatchingPriceForMeteredPriceSwitching({
          billingPricesPerPlanAndIntervalArray: catalog,
          targetMeteredPriceId: targetId,
          interval: SubscriptionInterval.Year,
        });

      expect(mapped.stripePriceId).toBe('price_year_24000');
    });
  });
});
