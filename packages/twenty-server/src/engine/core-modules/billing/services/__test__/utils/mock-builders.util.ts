import { type ObjectLiteral, type Repository } from 'typeorm';

import type Stripe from 'stripe';

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { type BillingSubscriptionPhaseService } from 'src/engine/core-modules/billing/services/billing-subscription-phase.service';
import { type StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';
import { type BillingMeterPrice } from 'src/engine/core-modules/billing/types/billing-meter-price.type';

import { buildSubscription } from './build-subscription.util';

export const repoMock = <T extends ObjectLiteral>() =>
  ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }) as unknown as jest.Mocked<Repository<T>>;

export const buildBillingPriceEntity = ({
  stripePriceId,
  planKey,
  interval,
  isMetered,
  tiers,
}: {
  stripePriceId: string;
  planKey: BillingPlanKey;
  interval: SubscriptionInterval;
  isMetered: boolean;
  tiers?: Stripe.Price.Tier[];
}): BillingPriceEntity | BillingMeterPrice =>
  ({
    stripePriceId,
    interval,
    billingProduct: {
      metadata: {
        planKey,
        productKey: isMetered
          ? BillingProductKey.WORKFLOW_NODE_EXECUTION
          : BillingProductKey.BASE_PRODUCT,
        priceUsageBased: isMetered
          ? BillingUsageType.METERED
          : BillingUsageType.LICENSED,
      },
    },
    ...(isMetered && tiers
      ? {
          tiers,
        }
      : {}),
  }) as BillingPriceEntity | BillingMeterPrice;

export const buildDefaultMeteredTiers = (
  upTo: number = 1000,
): Stripe.Price.Tier[] => [
  {
    up_to: upTo,
    flat_amount: upTo,
    unit_amount: null,
    flat_amount_decimal: String(upTo * 100),
    unit_amount_decimal: null,
  },
  {
    up_to: null,
    flat_amount: null,
    unit_amount: null,
    flat_amount_decimal: null,
    unit_amount_decimal: '100',
  },
];

export const arrangeBillingSubscriptionRepositoryFindOneOrFail = (
  billingSubscriptionRepository: jest.Mocked<
    Repository<BillingSubscriptionEntity>
  >,
  params: {
    planKey?: BillingPlanKey;
    interval?: SubscriptionInterval;
    licensedPriceId?: string;
    meteredPriceId?: string;
    seats?: number;
    workspaceId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  } = {},
) =>
  jest
    .spyOn(billingSubscriptionRepository, 'findOneOrFail')
    .mockResolvedValue(buildSubscription(params));

export const arrangeBillingPriceRepositoryFindOneOrFail = (
  billingPriceRepository: jest.Mocked<Repository<BillingPriceEntity>>,
  priceIdToPriceMap: Record<string, BillingPriceEntity | BillingMeterPrice>,
) =>
  jest
    .spyOn(billingPriceRepository, 'findOneOrFail')
    .mockImplementation(async (criteria: unknown) => {
      const where = (criteria as { where?: { stripePriceId?: string } })?.where;
      const priceId = where?.stripePriceId;

      if (priceId && priceIdToPriceMap[priceId]) {
        return priceIdToPriceMap[priceId] as BillingPriceEntity;
      }

      return {} as BillingPriceEntity;
    });

export const arrangeStripeSubscriptionScheduleServiceLoadSubscriptionSchedule =
  (
    stripeSubscriptionScheduleService: jest.Mocked<StripeSubscriptionScheduleService>,
    result: {
      schedule?: Stripe.SubscriptionSchedule;
      currentPhase?: Stripe.SubscriptionSchedule.Phase;
      nextPhase?: Stripe.SubscriptionSchedule.Phase;
    } = {},
  ) =>
    jest
      .spyOn(stripeSubscriptionScheduleService, 'loadSubscriptionSchedule')
      .mockResolvedValue(result as never);

export const arrangeStripeSubscriptionScheduleServiceCreateSubscriptionSchedule =
  (
    stripeSubscriptionScheduleService: jest.Mocked<StripeSubscriptionScheduleService>,
    currentPhase: Stripe.SubscriptionSchedule.Phase = {} as Stripe.SubscriptionSchedule.Phase,
  ) =>
    jest
      .spyOn(stripeSubscriptionScheduleService, 'createSubscriptionSchedule')
      .mockResolvedValue({
        schedule: {
          id: 'schedule_1',
        } as unknown as Stripe.Response<Stripe.SubscriptionSchedule>,
        currentPhase,
      });

export const arrangeBillingProductServiceGetProductPrices = (
  billingProductService: jest.Mocked<BillingProductService>,
  prices: BillingPriceEntity[],
) =>
  jest
    .spyOn(billingProductService, 'getProductPrices')
    .mockResolvedValue(prices);

export const arrangeBillingSubscriptionPhaseServiceToPhaseUpdateParams = (
  billingSubscriptionPhaseService: jest.Mocked<BillingSubscriptionPhaseService>,
  result: Stripe.SubscriptionScheduleUpdateParams.Phase = {} as Stripe.SubscriptionScheduleUpdateParams.Phase,
) =>
  jest
    .spyOn(billingSubscriptionPhaseService, 'toPhaseUpdateParams')
    .mockReturnValue(result);

export const buildSchedulePhase = ({
  licensedPriceId,
  meteredPriceId,
  seats = 1,
  startDate = Math.floor(Date.now() / 1000),
  endDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
}: {
  licensedPriceId: string;
  meteredPriceId: string;
  seats?: number;
  startDate?: number;
  endDate?: number;
}): Stripe.SubscriptionSchedule.Phase =>
  ({
    start_date: startDate,
    end_date: endDate,
    items: [
      { price: licensedPriceId, quantity: seats },
      { price: meteredPriceId },
    ],
  }) as Stripe.SubscriptionSchedule.Phase;
