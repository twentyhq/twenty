import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectLiteral, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type SubscriptionWithSchedule } from 'src/engine/core-modules/billing/types/billing-subscription-with-schedule.type';
import { type BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type MeterBillingPriceTiers } from 'src/engine/core-modules/billing/types/meter-billing-price-tier.type';
import { type BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';
import { BillingPriceService } from 'src/engine/core-modules/billing/services/billing-price.service';

function repoMock<T extends ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

const LICENSE_PRICE_ENTERPRISE_MONTH_ID = 'LICENSE_PRICE_ENTERPRISE_MONTH_ID';
const LICENSE_PRICE_PRO_MONTH_ID = 'LICENCE_PRICE_PRO_MONTH_ID';
const LICENSE_PRICE_ENTERPRISE_YEAR_ID = 'LICENSE_PRICE_ENTERPRISE_YEAR_ID';
const LICENSE_PRICE_PRO_YEAR_ID = 'LICENSE_PRICE_PRO_YEAR_ID';

const METER_PRICE_ENTERPRISE_MONTH_ID = 'METER_PRICE_ENTERPRISE_MONTH_ID';
const METER_PRICE_PRO_MONTH_ID = 'METER_PRICE_PRO_MONTH_ID';
const METER_PRICE_ENTERPRISE_YEAR_ID = 'METER_PRICE_ENTERPRISE_YEAR_ID';
const METER_PRICE_PRO_YEAR_ID = 'METER_PRICE_PRO_YEAR_ID';

const METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID =
  'METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID';
const METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID =
  'METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID';
const METER_PRICE_PRO_MONTH_TIER_LOW_ID = 'METER_PRICE_PRO_MONTH_TIER_LOW_ID';
const METER_PRICE_PRO_MONTH_TIER_HIGH_ID = 'METER_PRICE_PRO_MONTH_TIER_HIGH_ID';

describe('BillingSubscriptionService', () => {
  let module: TestingModule;
  let service: BillingSubscriptionService;
  let billingSubscriptionRepository: Repository<BillingSubscription>;
  let billingPriceRepository: Repository<BillingPrice>;
  let billingProductService: BillingProductService;
  let stripeSubscriptionScheduleService: StripeSubscriptionScheduleService;
  let stripeSubscriptionService: StripeSubscriptionService;
  let billingSubscriptionPhaseService: BillingSubscriptionPhaseService;

  const currentSubscription = {
    id: 'sub_db_1',
    workspaceId: 'ws_1',
    stripeSubscriptionId: 'sub_1',
    status: SubscriptionStatus.Active,
    interval: SubscriptionInterval.Month,
    billingSubscriptionItems: [
      {
        stripeSubscriptionItemId: 'si_licensed',
        stripeProductId: 'prod_base',
        stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
        billingProduct: {
          metadata: {
            planKey: BillingPlanKey.PRO,
            productKey: BillingProductKey.BASE_PRODUCT,
            priceUsageBased: BillingUsageType.LICENSED,
          },
        },
      },
      {
        stripeSubscriptionItemId: 'si_metered',
        stripeProductId: 'prod_metered',
        stripePriceId: METER_PRICE_PRO_MONTH_ID,
        billingProduct: {
          metadata: {
            planKey: BillingPlanKey.PRO,
            productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            priceUsageBased: BillingUsageType.METERED,
          },
        },
      },
    ],
  } as BillingSubscription;

  const arrangeBillingPriceRepositoryFindOneOrFail = () => {
    const resolvePrice = (criteria: any) => {
      const priceId =
        criteria?.stripePriceId ?? criteria?.where?.stripePriceId ?? criteria;
      const id = String(priceId).toUpperCase();
      const isMetered = id.includes('METER');
      const interval = id.includes('YEAR')
        ? SubscriptionInterval.Year
        : SubscriptionInterval.Month;

      const base: Partial<BillingPrice> = {
        stripePriceId: priceId,
        interval,
        billingProduct: {
          metadata: {
            planKey: BillingPlanKey.ENTERPRISE,
            productKey: isMetered
              ? BillingProductKey.WORKFLOW_NODE_EXECUTION
              : BillingProductKey.BASE_PRODUCT,
            priceUsageBased: isMetered
              ? BillingUsageType.METERED
              : BillingUsageType.LICENSED,
          },
        } as BillingProduct,
      };

      if (isMetered) {
        return {
          ...base,
          tiers: [
            {
              up_to: 12000,
              flat_amount: 12000,
              unit_amount: null,
              flat_amount_decimal: '1200000',
              unit_amount_decimal: null,
            },
            {
              up_to: null,
              flat_amount: null,
              unit_amount: null,
              flat_amount_decimal: null,
              unit_amount_decimal: '1200',
            },
          ],
        } as BillingMeterPrice;
      }

      return base as BillingPrice;
    };

    return jest
      .spyOn(billingPriceRepository, 'findOneOrFail')
      .mockImplementation(async (criteria: any) => resolvePrice(criteria));
  };

  const arrangeBillingSubscriptionRepositoryFind = (
    overrides: {
      planKey?: BillingPlanKey;
      interval?: SubscriptionInterval;
      licensedPriceId?: string;
      meteredPriceId?: string;
      seats?: number;
      workspaceId?: string;
      stripeSubscriptionId?: string;
    } = {},
  ) => {
    const sub: BillingSubscription = {
      ...currentSubscription,
      workspaceId: overrides.workspaceId ?? currentSubscription.workspaceId,
      stripeSubscriptionId:
        overrides.stripeSubscriptionId ??
        currentSubscription.stripeSubscriptionId,
      interval: overrides.interval ?? currentSubscription.interval,
      billingSubscriptionItems: [
        {
          ...currentSubscription.billingSubscriptionItems[0],
          stripePriceId:
            overrides.licensedPriceId ??
            currentSubscription.billingSubscriptionItems[0].stripePriceId,
          quantity:
            overrides.seats ??
            currentSubscription.billingSubscriptionItems[0].quantity ??
            7,
          billingProduct: {
            ...currentSubscription.billingSubscriptionItems[0].billingProduct,
            metadata: {
              ...currentSubscription.billingSubscriptionItems[0].billingProduct
                .metadata,
              planKey:
                overrides.planKey ??
                currentSubscription.billingSubscriptionItems[0].billingProduct
                  .metadata.planKey,
              productKey: BillingProductKey.BASE_PRODUCT,
              priceUsageBased: BillingUsageType.LICENSED,
            },
          },
        },
        {
          ...currentSubscription.billingSubscriptionItems[1],
          stripePriceId:
            overrides.meteredPriceId ??
            currentSubscription.billingSubscriptionItems[1].stripePriceId,
          billingProduct: {
            ...currentSubscription.billingSubscriptionItems[1].billingProduct,
            metadata: {
              ...currentSubscription.billingSubscriptionItems[1].billingProduct
                .metadata,
              planKey:
                overrides.planKey ??
                currentSubscription.billingSubscriptionItems[1].billingProduct
                  .metadata.planKey,
              productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
              priceUsageBased: BillingUsageType.METERED,
            },
          },
        },
      ],
    } as BillingSubscription;

    return jest
      .spyOn(billingSubscriptionRepository, 'find')
      .mockResolvedValueOnce([sub]);
  };

  const arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule =
    (phases: Array<Partial<Stripe.SubscriptionSchedule.Phase>> = []) =>
      jest
        .spyOn(
          stripeSubscriptionScheduleService,
          'findOrCreateSubscriptionSchedule',
        )
        .mockResolvedValue({
          id: 'scheduleId',
          phases,
        } as unknown as Stripe.SubscriptionSchedule);

  const arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase = ({
    planKey = BillingPlanKey.ENTERPRISE,
    interval = SubscriptionInterval.Year,
    licensedPriceId = LICENSE_PRICE_ENTERPRISE_YEAR_ID,
    meteredPriceId = METER_PRICE_ENTERPRISE_YEAR_ID,
    quantity = 7,
    meteredTiers = [
      {
        up_to: 1000,
        flat_amount: 1000,
        unit_amount: null,
        flat_amount_decimal: '100000',
        unit_amount_decimal: null,
      },
      {
        up_to: null,
        flat_amount: null,
        unit_amount: null,
        flat_amount_decimal: null,
        unit_amount_decimal: '100',
      },
    ] as MeterBillingPriceTiers,
  }: {
    planKey?: BillingPlanKey;
    interval?: SubscriptionInterval;
    licensedPriceId?: string;
    meteredPriceId?: string;
    quantity?: number;
    meteredTiers?: MeterBillingPriceTiers;
  } = {}) =>
    jest
      .spyOn(billingSubscriptionPhaseService, 'getDetailsFromPhase')
      .mockResolvedValueOnce({
        licensedPrice: {
          stripePriceId: licensedPriceId,
          quantity,
        } as unknown as BillingPrice,
        meteredPrice: {
          stripePriceId: meteredPriceId,
          tiers: meteredTiers,
        } as unknown as BillingMeterPrice,
        plan: {
          planKey,
          licensedProducts: [],
          meteredProducts: [],
        } as BillingGetPlanResult,
        quantity,
        interval,
      });

  const arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences = (
    sequences: Array<{
      planKey?: BillingPlanKey;
      interval?: SubscriptionInterval;
      licensedPriceId?: string;
      meteredPriceId?: string;
      quantity?: number;
      meteredTiers?: MeterBillingPriceTiers;
    }> = [{}],
  ) => {
    const spy = jest.spyOn(
      billingSubscriptionPhaseService,
      'getDetailsFromPhase',
    );

    sequences.forEach((cfg) => {
      const {
        planKey = BillingPlanKey.ENTERPRISE,
        interval = SubscriptionInterval.Year,
        licensedPriceId = LICENSE_PRICE_ENTERPRISE_YEAR_ID,
        meteredPriceId = METER_PRICE_ENTERPRISE_YEAR_ID,
        quantity = 7,
        meteredTiers = [
          {
            up_to: 1000,
            flat_amount: 1000,
            unit_amount: null,
            flat_amount_decimal: '100000',
            unit_amount_decimal: null,
          },
          {
            up_to: null,
            flat_amount: null,
            unit_amount: null,
            flat_amount_decimal: null,
            unit_amount_decimal: '100',
          },
        ] as MeterBillingPriceTiers,
      } = cfg ?? {};

      spy.mockResolvedValueOnce({
        licensedPrice: {
          stripePriceId: licensedPriceId,
          quantity,
        } as unknown as BillingPrice,
        meteredPrice: {
          stripePriceId: meteredPriceId,
          tiers: meteredTiers,
        } as unknown as BillingMeterPrice,
        plan: {
          planKey,
          licensedProducts: [],
          meteredProducts: [],
        } as BillingGetPlanResult,
        quantity,
        interval,
      });
    });

    return spy;
  };

  const arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences = (
    snapshots: Stripe.SubscriptionScheduleUpdateParams.Phase[] = [
      {} as Stripe.SubscriptionScheduleUpdateParams.Phase,
    ],
  ) => {
    const spy = jest.spyOn(billingSubscriptionPhaseService, 'buildSnapshot');

    snapshots.forEach((phase) => {
      spy.mockResolvedValueOnce(phase);
    });

    return spy;
  };

  const arrangeBillingProductServiceGetProductPrices = (
    prices: Array<Partial<BillingPrice>> = [
      {
        stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
        interval: SubscriptionInterval.Year,
        billingProduct: {
          metadata: {
            planKey: BillingPlanKey.ENTERPRISE,
            productKey: BillingProductKey.BASE_PRODUCT,
            priceUsageBased: BillingUsageType.LICENSED,
          },
        },
      } as Partial<BillingPrice>,
      {
        stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
        interval: SubscriptionInterval.Year,
        tiers: [
          {
            up_to: 12000,
            flat_amount: 12000,
            unit_amount: null,
            flat_amount_decimal: '1200000',
            unit_amount_decimal: null,
          },
          {
            up_to: null,
            flat_amount: null,
            unit_amount: null,
            flat_amount_decimal: null,
            unit_amount_decimal: '1200',
          },
        ],
        billingProduct: {
          metadata: {
            planKey: BillingPlanKey.ENTERPRISE,
            productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
            priceUsageBased: BillingUsageType.METERED,
          },
        },
      } as Partial<BillingPrice>,
    ],
  ) =>
    jest
      .spyOn(billingProductService, 'getProductPrices')
      .mockResolvedValue(prices as BillingPrice[]);

  const arrangeBillingSubscriptionRepositoryFindOneOrFail = ({
    planKey = BillingPlanKey.PRO,
    interval = SubscriptionInterval.Month,
    licensedPriceId = LICENSE_PRICE_PRO_MONTH_ID,
    meteredPriceId = METER_PRICE_PRO_MONTH_ID,
    seats = 7,
    workspaceId = 'ws_1',
    stripeSubscriptionId = 'sub_1',
  }: {
    planKey?: BillingPlanKey;
    interval?: SubscriptionInterval;
    licensedPriceId?: string;
    meteredPriceId?: string;
    seats?: number;
    workspaceId?: string;
    stripeSubscriptionId?: string;
  } = {}) =>
    jest
      .spyOn(billingSubscriptionRepository, 'findOneOrFail')
      .mockResolvedValue({
        id: 'sub_db_param',
        workspaceId,
        stripeSubscriptionId,
        status: SubscriptionStatus.Active,
        interval,
        billingSubscriptionItems: [
          {
            stripeSubscriptionItemId: 'si_licensed',
            stripeProductId: 'prod_base',
            stripePriceId: licensedPriceId,
            quantity: seats,
            billingProduct: {
              metadata: {
                planKey,
                productKey: BillingProductKey.BASE_PRODUCT,
                priceUsageBased: BillingUsageType.LICENSED,
              },
            },
          },
          {
            stripeSubscriptionItemId: 'si_metered',
            stripeProductId: 'prod_metered',
            stripePriceId: meteredPriceId,
            billingProduct: {
              metadata: {
                planKey,
                productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                priceUsageBased: BillingUsageType.METERED,
              },
            },
          },
        ],
      } as BillingSubscription);

  const arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync = () => {
    const spy = jest
      .spyOn(stripeSubscriptionService, 'updateSubscription')
      .mockResolvedValueOnce({} as Stripe.Subscription);

    jest
      .spyOn(service, 'syncSubscriptionToDatabase')
      .mockResolvedValueOnce({} as BillingSubscription);

    return spy;
  };

  const arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule =
    () =>
      jest
        .spyOn(stripeSubscriptionScheduleService, 'getSubscriptionWithSchedule')
        .mockResolvedValue({
          id: 'sub_id',
          schedule: { id: 'scheduleId' },
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000),
          items: { data: [] },
          latest_invoice: {
            payment_intent: {
              charges: { data: [] },
            },
          },
        } as unknown as SubscriptionWithSchedule);

  const arrangeBillingSubscriptionPhaseServiceToSnapshot = (
    licensedPriceId: string,
    meteredPriceId: string,
    quantity = 7,
  ) =>
    jest.spyOn(billingSubscriptionPhaseService, 'toSnapshot').mockReturnValue({
      end_date: Date.now() + 1000,
      items: [{ price: licensedPriceId, quantity }, { price: meteredPriceId }],
    } as Stripe.SubscriptionScheduleUpdateParams.Phase);

  const arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences = (
    sequences: Array<{
      currentEditable: {
        licensedPriceId: string;
        meteredPriceId: string;
        quantity?: number;
      };
      nextEditable?: {
        licensedPriceId?: string;
        meteredPriceId?: string;
        quantity?: number;
      };
    }> = [],
  ) => {
    const spy = jest.spyOn(
      stripeSubscriptionScheduleService,
      'getEditablePhases',
    );

    sequences.forEach((sequence) => {
      spy.mockReturnValueOnce({
        currentEditable: {
          items: [
            {
              price: sequence.currentEditable.licensedPriceId,
              quantity: sequence.currentEditable.quantity ?? 7,
            },
            { price: sequence.currentEditable.meteredPriceId },
          ],
        } as Stripe.SubscriptionSchedule.Phase,
        nextEditable: sequence.nextEditable
          ? ({
              items: [
                {
                  price: sequence.nextEditable.licensedPriceId,
                  quantity: sequence.nextEditable.quantity ?? 7,
                },
                { price: sequence.nextEditable.meteredPriceId },
              ],
            } as Stripe.SubscriptionSchedule.Phase)
          : undefined,
      });
    });

    return spy;
  };

  const arrangeBillingProductServiceGetProductPricesSequence = (
    first: Array<Partial<BillingPrice>>,
    second: Array<Partial<BillingPrice>>,
  ) => {
    const spy = jest.spyOn(billingProductService, 'getProductPrices');

    spy.mockResolvedValueOnce(first as BillingPrice[]);
    spy.mockResolvedValueOnce(second as BillingPrice[]);

    return spy;
  };

  const arrangeServiceSyncSubscriptionToDatabase = () =>
    jest
      .spyOn(service, 'syncSubscriptionToDatabase')
      .mockResolvedValue({} as BillingSubscription);

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BillingSubscriptionService,
        {
          provide: BillingPlanService,
          useValue: {
            getPlanBaseProduct: jest.fn(),
            listPlans: jest.fn(),
            getPlanByPriceId: jest.fn(),
            getPricesPerPlanByInterval: jest.fn(),
          },
        },
        {
          provide: BillingProductService,
          useValue: {
            getProductPrices: jest.fn(),
          },
        },
        {
          provide: StripeCustomerService,
          useValue: {
            hasPaymentMethod: jest.fn(),
          },
        },
        { provide: StripeSubscriptionItemService, useValue: {} },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn(),
            findOrCreateSubscriptionSchedule: jest.fn(),
            getEditablePhases: jest.fn(),
            replaceEditablePhases: jest.fn(),
          },
        },
        {
          provide: StripeSubscriptionService,
          useValue: {
            updateSubscription: jest.fn(),
            cancelSubscription: jest.fn(),
            collectLastInvoice: jest.fn(),
          },
        },
        {
          provide: BillingPriceService,
          useValue: {
            getBillingThresholdsByMeterPriceId: jest.fn().mockResolvedValue({
              amount_gte: 1000,
              reset_billing_cycle_anchor: false,
            }),
          },
        },
        {
          provide: StripeSubscriptionScheduleService,
          useValue: {
            getSubscriptionWithSchedule: jest.fn(),
            findOrCreateSubscriptionSchedule: jest.fn(),
            getEditablePhases: jest.fn(),
            replaceEditablePhases: jest.fn(),
          },
        },
        {
          provide: BillingSubscriptionPhaseService,
          useValue: {
            getDetailsFromPhase: jest.fn(),
            toSnapshot: jest.fn(),
            buildSnapshot: jest.fn(),
            getLicensedPriceIdFromSnapshot: jest.fn(),
            isSamePhaseSignature: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(0),
          },
        },
        {
          provide: getRepositoryToken(BillingEntitlement),
          useValue: repoMock<BillingEntitlement>(),
        },
        {
          provide: getRepositoryToken(BillingSubscription),
          useValue: repoMock<BillingSubscription>(),
        },
        {
          provide: getRepositoryToken(BillingPrice),
          useValue: repoMock<BillingPrice>(),
        },
        {
          provide: getRepositoryToken(BillingSubscriptionItem),
          useValue: repoMock<BillingSubscriptionItem>(),
        },
        {
          provide: getRepositoryToken(BillingCustomer),
          useValue: repoMock<BillingCustomer>(),
        },
      ],
    }).compile();

    service = module.get(BillingSubscriptionService);
    billingSubscriptionRepository = module.get<Repository<BillingSubscription>>(
      getRepositoryToken(BillingSubscription),
    );
    billingPriceRepository = module.get<Repository<BillingPrice>>(
      getRepositoryToken(BillingPrice),
    );
    billingProductService = module.get<BillingProductService>(
      BillingProductService,
    );
    stripeSubscriptionScheduleService =
      module.get<StripeSubscriptionScheduleService>(
        StripeSubscriptionScheduleService,
      );
    stripeSubscriptionService = module.get<StripeSubscriptionService>(
      StripeSubscriptionService,
    );
    stripeSubscriptionScheduleService =
      module.get<StripeSubscriptionScheduleService>(
        StripeSubscriptionScheduleService,
      );
    billingSubscriptionPhaseService =
      module.get<BillingSubscriptionPhaseService>(
        BillingSubscriptionPhaseService,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePlan', () => {
    describe('upgrade', () => {
      it('PRO -> ENTERPRISE without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind();
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();
        const spyGetDetailsFromPhase =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.PRO,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
            meteredPriceId: METER_PRICE_PRO_MONTH_ID,
            quantity: 7,
          });

        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);

        const spyBillingPriceFindOneOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spySubFindOneOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();
        const spyUpdateSubscription =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(currentSubscription.stripeSubscriptionId, {
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              quantity: 7,
            },
            {
              id: 'si_metered',
              price: METER_PRICE_ENTERPRISE_MONTH_ID,
            },
          ],
          metadata: {
            plan: 'ENTERPRISE',
          },
          proration_behavior: 'create_prorations',
        });
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).not.toHaveBeenCalled();
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(2);
        expect(spyBillingPriceFindOneOrFail).toHaveBeenCalledTimes(1);
        expect(spyGetDetailsFromPhase).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(2);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(1);
        expect(spySubFindOneOrFail).toHaveBeenCalledTimes(1);
        expect(spyUpdateSubscription).toHaveBeenCalledTimes(1);
      });
      it('PRO -> ENTERPRISE with existing phases', async () => {
        const spyBillingSubscriptionRepositoryFind2 =
          arrangeBillingSubscriptionRepositoryFind();
        const spyFindOrCreateSchedule2 =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );
        const spyGetDetailsFromPhaseSeq2 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences([
            {
              planKey: BillingPlanKey.PRO,
              interval: SubscriptionInterval.Year,
              licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
              meteredPriceId: METER_PRICE_PRO_YEAR_ID,
              quantity: 7,
            },
            {
              planKey: BillingPlanKey.PRO,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
              meteredPriceId: METER_PRICE_PRO_MONTH_ID,
              quantity: 7,
            },
          ]);
        const spyGetEditablePhasesSeq2 =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
                meteredPriceId: METER_PRICE_PRO_YEAR_ID,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_ID,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_ID,
              },
            },
          ]);
        const spyGetProductPrices2 =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
              interval: SubscriptionInterval.Year,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
              interval: SubscriptionInterval.Year,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);
        const spyToSnapshot2 = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          METER_PRICE_ENTERPRISE_YEAR_ID,
        );
        const spyPriceFindByOrFail2 =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spySubFindByOrFail2 =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spyBuildSnapshot2 =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);
        const spyGetSubWithSchedule2 =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindOneOrFail2 =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();
        const spyUpdateSubscription2 =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();
        const spySyncDB2 = arrangeServiceSyncSubscriptionToDatabase();

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(currentSubscription.stripeSubscriptionId, {
          billing_thresholds: {
            amount_gte: 1000,
            reset_billing_cycle_anchor: false,
          },
          items: [
            {
              id: 'si_licensed',
              price: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
              quantity: 7,
            },
            { id: 'si_metered', price: METER_PRICE_ENTERPRISE_YEAR_ID },
          ],
          metadata: { plan: 'ENTERPRISE' },
          proration_behavior: 'create_prorations',
        });

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_YEAR_ID },
              ],
            }),
            nextPhase: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            }),
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind2).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule2).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhaseSeq2).toHaveBeenCalledTimes(2);
        expect(spyGetEditablePhasesSeq2).toHaveBeenCalledTimes(2);
        expect(spyGetProductPrices2).toHaveBeenCalledTimes(2);
        expect(spyToSnapshot2).toHaveBeenCalledTimes(1);
        expect(spySubFindByOrFail2).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshot2).toHaveBeenCalledTimes(1);
        expect(spyGetSubWithSchedule2).toHaveBeenCalledTimes(3);
        expect(spySubFindOneOrFail2).toHaveBeenCalledTimes(2);
        expect(spyUpdateSubscription2).toHaveBeenCalledTimes(1);
        expect(spySyncDB2).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail2).toHaveBeenCalledTimes(2);
      });
    });
    describe('downgrade', () => {
      it('ENTERPRISE -> PRO without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFindD1 =
          arrangeBillingSubscriptionRepositoryFind({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          });

        const spyFindOrCreateScheduleD1 =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();
        const spyGetDetailsFromPhaseD1 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            quantity: 7,
          });

        const spyGetEditablePhasesD1 =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPricesSeqD1 =
          arrangeBillingProductServiceGetProductPricesSequence(
            [
              {
                stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                interval: SubscriptionInterval.Month,
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.ENTERPRISE,
                    productKey: BillingProductKey.BASE_PRODUCT,
                    priceUsageBased: BillingUsageType.LICENSED,
                  },
                },
              } as Partial<BillingPrice>,
              {
                stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                interval: SubscriptionInterval.Month,
                tiers: [
                  {
                    up_to: 1000,
                    flat_amount: 1000,
                    unit_amount: null,
                    flat_amount_decimal: '100000',
                    unit_amount_decimal: null,
                  },
                  {
                    up_to: null,
                    flat_amount: null,
                    unit_amount: null,
                    flat_amount_decimal: null,
                    unit_amount_decimal: '100',
                  },
                ],
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.ENTERPRISE,
                    productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                    priceUsageBased: BillingUsageType.METERED,
                  },
                },
              } as Partial<BillingPrice>,
            ],
            [
              {
                stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
                interval: SubscriptionInterval.Month,
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.PRO,
                    productKey: BillingProductKey.BASE_PRODUCT,
                    priceUsageBased: BillingUsageType.LICENSED,
                  },
                },
              } as Partial<BillingPrice>,
              {
                stripePriceId: METER_PRICE_PRO_MONTH_ID,
                interval: SubscriptionInterval.Month,
                tiers: [
                  {
                    up_to: 1000,
                    flat_amount: 1000,
                    unit_amount: null,
                    flat_amount_decimal: '100000',
                    unit_amount_decimal: null,
                  },
                  {
                    up_to: null,
                    flat_amount: null,
                    unit_amount: null,
                    flat_amount_decimal: null,
                    unit_amount_decimal: '100',
                  },
                ],
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.PRO,
                    productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                    priceUsageBased: BillingUsageType.METERED,
                  },
                },
              } as Partial<BillingPrice>,
            ],
          );
        const spyToSnapshotD1 =
          arrangeBillingSubscriptionPhaseServiceToSnapshot(
            LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            METER_PRICE_ENTERPRISE_MONTH_ID,
          );
        const spyBuildSnapshotD1 =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spyPriceFindByOrFailD1 =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spyGetSubWithScheduleD1 =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFailD1 =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spySyncDBD1 = arrangeServiceSyncSubscriptionToDatabase();

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            }),
            nextPhase: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_ID },
              ],
            }),
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful (downgrade without existing phase)
        expect(spyBillingSubscriptionRepositoryFindD1).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateScheduleD1).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhaseD1).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhasesD1).toHaveBeenCalledTimes(2);
        expect(spyGetProductPricesSeqD1).toHaveBeenCalledTimes(2);
        expect(spyToSnapshotD1).toHaveBeenCalledTimes(1);
        expect(spyBuildSnapshotD1).toHaveBeenCalledTimes(1);
        expect(spyPriceFindByOrFailD1).toHaveBeenCalledTimes(2);
        expect(spyGetSubWithScheduleD1).toHaveBeenCalledTimes(3);
        expect(spySubFindByOrFailD1).toHaveBeenCalledTimes(1);
        expect(spySyncDBD1).toHaveBeenCalledTimes(1);
      });
      it('ENTERPRISE -> PRO with existing phases', async () => {
        const spyBillingSubscriptionRepositoryFindD2 =
          arrangeBillingSubscriptionRepositoryFind({
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            planKey: BillingPlanKey.ENTERPRISE,
          });

        const spyFindOrCreateScheduleD2 =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );
        const spyGetDetailsFromPhaseSeqD2 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences([
            {
              planKey: BillingPlanKey.ENTERPRISE,
              interval: SubscriptionInterval.Year,
              licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
              meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            },
            {
              planKey: BillingPlanKey.ENTERPRISE,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            },
          ]);

        const spyGetEditablePhasesSeqD2 =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPricesSeqD2 =
          arrangeBillingProductServiceGetProductPricesSequence(
            [
              {
                stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                interval: SubscriptionInterval.Month,
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.ENTERPRISE,
                    productKey: BillingProductKey.BASE_PRODUCT,
                    priceUsageBased: BillingUsageType.LICENSED,
                  },
                },
              } as Partial<BillingPrice>,
              {
                stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                interval: SubscriptionInterval.Month,
                tiers: [
                  {
                    up_to: 1000,
                    flat_amount: 1000,
                    unit_amount: null,
                    flat_amount_decimal: '100000',
                    unit_amount_decimal: null,
                  },
                  {
                    up_to: null,
                    flat_amount: null,
                    unit_amount: null,
                    flat_amount_decimal: null,
                    unit_amount_decimal: '100',
                  },
                ],
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.ENTERPRISE,
                    productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                    priceUsageBased: BillingUsageType.METERED,
                  },
                },
              } as Partial<BillingPrice>,
            ],
            [
              {
                stripePriceId: LICENSE_PRICE_PRO_MONTH_ID,
                interval: SubscriptionInterval.Month,
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.PRO,
                    productKey: BillingProductKey.BASE_PRODUCT,
                    priceUsageBased: BillingUsageType.LICENSED,
                  },
                },
              } as Partial<BillingPrice>,
              {
                stripePriceId: METER_PRICE_PRO_MONTH_ID,
                interval: SubscriptionInterval.Month,
                tiers: [
                  {
                    up_to: 1000,
                    flat_amount: 1000,
                    unit_amount: null,
                    flat_amount_decimal: '100000',
                    unit_amount_decimal: null,
                  },
                  {
                    up_to: null,
                    flat_amount: null,
                    unit_amount: null,
                    flat_amount_decimal: null,
                    unit_amount_decimal: '100',
                  },
                ],
                billingProduct: {
                  metadata: {
                    planKey: BillingPlanKey.PRO,
                    productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                    priceUsageBased: BillingUsageType.METERED,
                  },
                },
              } as Partial<BillingPrice>,
            ],
          );

        const spyToSnapshotD2 =
          arrangeBillingSubscriptionPhaseServiceToSnapshot(
            LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            METER_PRICE_ENTERPRISE_YEAR_ID,
          );
        const spyBuildSnapshotD2 =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spyPriceFindByOrFailD2 =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spyGetSubWithScheduleD2 =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFailD2 =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spySyncDBD2 = arrangeServiceSyncSubscriptionToDatabase();

        await service.changePlan({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).not.toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith('scheduleId', {
          currentPhaseSnapshot: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_YEAR_ID },
            ],
          }),
          nextPhase: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_PRO_MONTH_ID },
            ],
          }),
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful (downgrade with existing phases)
        expect(spyBillingSubscriptionRepositoryFindD2).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateScheduleD2).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhaseSeqD2).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhasesSeqD2).toHaveBeenCalledTimes(2);
        expect(spyGetProductPricesSeqD2).toHaveBeenCalledTimes(2);
        expect(spyToSnapshotD2).toHaveBeenCalledTimes(1);
        expect(spyBuildSnapshotD2).toHaveBeenCalledTimes(1);
        expect(spyPriceFindByOrFailD2).toHaveBeenCalledTimes(2);
        expect(spyGetSubWithScheduleD2).toHaveBeenCalledTimes(3);
        expect(spySubFindByOrFailD2).toHaveBeenCalledTimes(1);
        expect(spySyncDBD2).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('changeInterval', () => {
    describe('upgrade', () => {
      it('MONTHLY -> YEARLY without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind();
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();
        const spyGetDetailsFromPhase1 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
          });
        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices();
        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spySubFindOneOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();
        const spyUpdateSubscription =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();
        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spyGetDetailsFromPhase2 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            quantity: 7,
          });
        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeInterval({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(
          currentSubscription.stripeSubscriptionId,
          expect.objectContaining({
            items: [
              {
                id: 'si_licensed',
                price: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
              { id: 'si_metered', price: METER_PRICE_ENTERPRISE_YEAR_ID },
            ],
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(3);
        expect(spyGetDetailsFromPhase1).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(3);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(1);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(1);
        expect(spySubFindOneOrFail).toHaveBeenCalledTimes(1);
        expect(spyUpdateSubscription).toHaveBeenCalledTimes(1);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(3);
        expect(spySubFindByOrFail).toHaveBeenCalledTimes(1);
        expect(spyGetDetailsFromPhase2).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(1);
      });
      it('MONTHLY -> YEARLY with existing phases', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind();
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );

        const spyGetDetailsFromPhase1 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
            quantity: 7,
          });

        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
          ]);

        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
              interval: SubscriptionInterval.Year,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
              interval: SubscriptionInterval.Year,
              tiers: [
                {
                  up_to: 12000,
                  flat_amount: 12000,
                  unit_amount: null,
                  flat_amount_decimal: '1200000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '1200',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);

        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();
        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_YEAR_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);
        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          METER_PRICE_ENTERPRISE_MONTH_ID,
        );
        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();
        const spySubFindOneOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
          });

        const spyGetDetailsFromPhase2 =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Year,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            quantity: 7,
          });

        await service.changeInterval({ id: 'ws_1' } as Workspace);

        expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
            }),
            nextPhase: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_YEAR_ID },
              ],
            }),
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(3);
        expect(spyGetDetailsFromPhase1).toHaveBeenCalledTimes(2);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(3);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(2);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(4);
        expect(spySubFindByOrFail).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(2);
        expect(spySubFindOneOrFail).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhase2).toHaveBeenCalledTimes(2);
      });
    });
    describe('downgrade', () => {
      it('YEARLY -> MONTHLY without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            interval: SubscriptionInterval.Year,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            planKey: BillingPlanKey.ENTERPRISE,
          });
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();

        const spyGetDetailsFromPhase =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Year,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            quantity: 7,
          });

        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
            },
          ]);

        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);

        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          METER_PRICE_ENTERPRISE_YEAR_ID,
          7,
        );
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeInterval({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).not.toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith('scheduleId', {
          currentPhaseSnapshot: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_YEAR_ID },
            ],
          }),
          nextPhase: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          }),
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(3);
        expect(spyGetDetailsFromPhase).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(3);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(2);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(4);
        expect(spySubFindByOrFail).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(1);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(1);
      });
      it('YEARLY -> MONTHLY with existing phases', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            interval: SubscriptionInterval.Year,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            planKey: BillingPlanKey.ENTERPRISE,
          });
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );

        const spyGetDetailsFromPhase =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Year,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
            quantity: 7,
          });

        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
                meteredPriceId: METER_PRICE_PRO_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
                meteredPriceId: METER_PRICE_PRO_YEAR_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_YEAR_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_YEAR_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_YEAR_ID,
                meteredPriceId: METER_PRICE_PRO_YEAR_ID,
                quantity: 7,
              },
            },
          ]);

        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);

        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spySubFindByOrFail =
          arrangeBillingSubscriptionRepositoryFindOneOrFail();

        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_YEAR_ID,
          METER_PRICE_ENTERPRISE_YEAR_ID,
          7,
        );
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeInterval({ id: 'ws_1' } as Workspace);

        expect(
          stripeSubscriptionService.updateSubscription,
        ).not.toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith('scheduleId', {
          currentPhaseSnapshot: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_YEAR_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_YEAR_ID },
            ],
          }),
          nextPhase: expect.objectContaining({
            items: [
              { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
              { price: METER_PRICE_ENTERPRISE_MONTH_ID },
            ],
          }),
        });
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(3);
        expect(spyGetDetailsFromPhase).toHaveBeenCalledTimes(2);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(3);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(2);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(4);
        expect(spySubFindByOrFail).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(1);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('changeMeteredPrice', () => {
    describe('upgrade', () => {
      it('without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          });
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();
        const spyGetDetailsFromPhase =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhase({
            planKey: BillingPlanKey.ENTERPRISE,
            interval: SubscriptionInterval.Month,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
            quantity: 7,
            meteredTiers: [
              {
                up_to: 1000,
                flat_amount: 1000,
                unit_amount: null,
                flat_amount_decimal: '100000',
                unit_amount_decimal: null,
              },
              {
                up_to: null,
                flat_amount: null,
                unit_amount: null,
                flat_amount_decimal: null,
                unit_amount_decimal: '100',
              },
            ],
          });
        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 5000,
                  flat_amount: 5000,
                  unit_amount: null,
                  flat_amount_decimal: '500000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '500',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);
        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spyUpdateSubscription =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();
        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          METER_PRICE_ENTERPRISE_MONTH_ID,
          7,
        );
        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeMeteredPrice(
          { id: 'ws_1' } as Workspace,
          METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
        );

        expect(
          stripeSubscriptionService.updateSubscription,
        ).toHaveBeenCalledWith(
          currentSubscription.stripeSubscriptionId,
          expect.objectContaining({
            billing_thresholds: {
              amount_gte: 1000,
              reset_billing_cycle_anchor: false,
            },
            items: [
              {
                id: 'si_licensed',
                price: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                quantity: 7,
              },
              {
                id: 'si_metered',
                price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              },
            ],
            proration_behavior: 'none',
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhase).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(2);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(3);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(3);
        expect(spyUpdateSubscription).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(2);
      });
      it('with existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          });
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );
        const spyGetDetailsFromPhaseSeq =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences([
            {
              planKey: BillingPlanKey.ENTERPRISE,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              quantity: 7,
              meteredTiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
            },
            {
              planKey: BillingPlanKey.PRO,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
              meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
              quantity: 7,
              meteredTiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
            },
          ]);
        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 5000,
                  flat_amount: 5000,
                  unit_amount: null,
                  flat_amount_decimal: '500000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '500',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);
        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spyUpdateSubscription =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();

        // Snapshot courant (phase actuelle)
        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          7,
        );

        const spyBuildSnapshotSeq =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_HIGH_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_HIGH_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeMeteredPrice(
          { id: 'ws_1' } as Workspace,
          METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
        );

        expect(stripeSubscriptionService.updateSubscription).toHaveBeenCalled();
        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID },
              ],
            },
            nextPhase: {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_HIGH_ID },
              ],
            },
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhaseSeq).toHaveBeenCalledTimes(3);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(2);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(3);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(3);
        expect(spyUpdateSubscription).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshotSeq).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(2);
        expect(spySyncDB).toHaveBeenCalledTimes(2);
      });
    });
    describe('downgrade', () => {
      it('without existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
          });

        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule();
        const spyGetDetailsFromPhaseSeq =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences([
            {
              planKey: BillingPlanKey.ENTERPRISE,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              quantity: 7,
              meteredTiers: [
                {
                  up_to: 120_000_000,
                  flat_amount: 10_000,
                  unit_amount: null,
                  flat_amount_decimal: '1000000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
            },
          ]);
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);
        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 120_000_000,
                  flat_amount: 10_000,
                  unit_amount: null,
                  flat_amount_decimal: '1000000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 5000,
                  flat_amount: 5000,
                  unit_amount: null,
                  flat_amount_decimal: '500000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '500',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);
        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
          7,
        );

        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeMeteredPrice(
          { id: 'ws_1' } as Workspace,
          METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
        );

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID },
              ],
            }),
            nextPhase: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID },
              ],
            }),
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(1);
        expect(spyGetDetailsFromPhaseSeq).toHaveBeenCalledTimes(1);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(1);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(1);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(3);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(2);
        expect(spyToSnapshot).toHaveBeenCalledTimes(1);
        expect(spySyncDB).toHaveBeenCalledTimes(1);
      });
      it('with existing phase', async () => {
        const spyBillingSubscriptionRepositoryFind =
          arrangeBillingSubscriptionRepositoryFind({
            planKey: BillingPlanKey.ENTERPRISE,
            licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
            meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          });
        const spyFindOrCreateSchedule =
          arrangeStripeSubscriptionScheduleServiceFindOrCreateSubscriptionSchedule(
            [{}, {}],
          );
        const spyGetDetailsFromPhaseSeq =
          arrangeBillingSubscriptionPhaseServiceGetDetailsFromPhaseSequences([
            {
              planKey: BillingPlanKey.ENTERPRISE,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              quantity: 7,
              meteredTiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
            },
            {
              planKey: BillingPlanKey.PRO,
              interval: SubscriptionInterval.Month,
              licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
              meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
              quantity: 7,
              meteredTiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
            },
          ]);
        const spyGetEditablePhases =
          arrangeStripeSubscriptionScheduleServiceGetEditablePhasesSequences([
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
            {
              currentEditable: {
                licensedPriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
                meteredPriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
              nextEditable: {
                licensedPriceId: LICENSE_PRICE_PRO_MONTH_ID,
                meteredPriceId: METER_PRICE_PRO_MONTH_TIER_LOW_ID,
                quantity: 7,
              },
            },
          ]);
        const spyGetProductPrices =
          arrangeBillingProductServiceGetProductPrices([
            {
              stripePriceId: LICENSE_PRICE_ENTERPRISE_MONTH_ID,
              interval: SubscriptionInterval.Month,
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.BASE_PRODUCT,
                  priceUsageBased: BillingUsageType.LICENSED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 1000,
                  flat_amount: 1000,
                  unit_amount: null,
                  flat_amount_decimal: '100000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '100',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
            {
              stripePriceId: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID,
              interval: SubscriptionInterval.Month,
              tiers: [
                {
                  up_to: 5000,
                  flat_amount: 5000,
                  unit_amount: null,
                  flat_amount_decimal: '500000',
                  unit_amount_decimal: null,
                },
                {
                  up_to: null,
                  flat_amount: null,
                  unit_amount: null,
                  flat_amount_decimal: null,
                  unit_amount_decimal: '500',
                },
              ],
              billingProduct: {
                metadata: {
                  planKey: BillingPlanKey.ENTERPRISE,
                  productKey: BillingProductKey.WORKFLOW_NODE_EXECUTION,
                  priceUsageBased: BillingUsageType.METERED,
                },
              },
            } as Partial<BillingPrice>,
          ]);
        const spyPriceFindByOrFail =
          arrangeBillingPriceRepositoryFindOneOrFail();

        const spyGetSubWithSchedule =
          arrangeStripeSubscriptionScheduleServiceGetSubscriptionWithSchedule();
        const spyUpdateSubscription =
          arrangeStripeSubscriptionServiceUpdateSubscriptionAndSync();

        // Snapshot courant (phase actuelle)
        const spyToSnapshot = arrangeBillingSubscriptionPhaseServiceToSnapshot(
          LICENSE_PRICE_ENTERPRISE_MONTH_ID,
          METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
          7,
        );

        const spyBuildSnapshotSeq =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_LOW_ID },
              ],
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);
        const spyBuildSnapshot =
          arrangeBillingSubscriptionPhaseServiceBuildSnapshotSequences([
            {
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_HIGH_ID },
              ],
              proration_behavior: 'none',
            } as Stripe.SubscriptionScheduleUpdateParams.Phase,
          ]);

        const spySyncDB = arrangeServiceSyncSubscriptionToDatabase();

        await service.changeMeteredPrice(
          { id: 'ws_1' } as Workspace,
          METER_PRICE_ENTERPRISE_MONTH_TIER_LOW_ID,
        );

        expect(
          stripeSubscriptionScheduleService.replaceEditablePhases,
        ).toHaveBeenCalledWith(
          'scheduleId',
          expect.objectContaining({
            currentPhaseSnapshot: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_ENTERPRISE_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_ENTERPRISE_MONTH_TIER_HIGH_ID },
              ],
            }),
            nextPhase: expect.objectContaining({
              items: [
                { price: LICENSE_PRICE_PRO_MONTH_ID, quantity: 7 },
                { price: METER_PRICE_PRO_MONTH_TIER_LOW_ID },
              ],
            }),
          }),
        );
        expect(service.syncSubscriptionToDatabase).toHaveBeenCalled();

        // verify arrange calls were useful
        expect(spyBillingSubscriptionRepositoryFind).toHaveBeenCalledTimes(1);
        expect(spyFindOrCreateSchedule).toHaveBeenCalledTimes(2);
        expect(spyGetDetailsFromPhaseSeq).toHaveBeenCalledTimes(3);
        expect(spyGetEditablePhases).toHaveBeenCalledTimes(2);
        expect(spyGetProductPrices).toHaveBeenCalledTimes(2);
        expect(spyPriceFindByOrFail).toHaveBeenCalledTimes(3);
        expect(spyGetSubWithSchedule).toHaveBeenCalledTimes(3);
        expect(spyUpdateSubscription).toHaveBeenCalledTimes(1);
        expect(spyToSnapshot).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshotSeq).toHaveBeenCalledTimes(2);
        expect(spyBuildSnapshot).toHaveBeenCalledTimes(2);
        expect(spySyncDB).toHaveBeenCalledTimes(2);
      });
    });
  });
});
