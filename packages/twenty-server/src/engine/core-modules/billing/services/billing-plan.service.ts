/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';
import { findOrThrow } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { type BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';
import { type BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';
import {
  BILLING_PLAN_FEATURES,
  BILLING_PRICES_DISPLAY_MXN,
  getFormattedPrice,
} from 'src/engine/core-modules/billing/constants/billing-prices-mxn.constant';

export interface PlanDetails {
  planKey: BillingPlanKey;
  name: string;
  description: string;
  features: string[];
  limits: {
    users: number;
    records: number;
    aiCreditsPerMonth: number;
  };
  prices: {
    monthly: {
      amount: number | null;
      currency: string;
      formatted: string;
      savings?: string;
    };
    yearly: {
      amount: number | null;
      currency: string;
      formatted: string;
      savings?: string;
    };
  };
}

@Injectable()
export class BillingPlanService {
  protected readonly logger = new Logger(BillingPlanService.name);
  constructor(
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
  ) {}

  async getProductsByProductMetadata({
    planKey,
    priceUsageBased,
    productKey,
  }: {
    planKey: BillingPlanKey;
    priceUsageBased: BillingUsageType;
    productKey: BillingProductKey;
  }): Promise<BillingProductEntity[]> {
    return await this.billingProductRepository.find({
      where: {
        metadata: JsonContains({
          priceUsageBased,
          planKey,
          productKey,
        }),
        active: true,
      },
      relations: ['billingPrices'],
    });
  }

  async getPlanBaseProduct(
    planKey: BillingPlanKey,
  ): Promise<BillingProductEntity> {
    const [baseProduct] = await this.getProductsByProductMetadata({
      planKey,
      priceUsageBased: BillingUsageType.LICENSED,
      productKey: BillingProductKey.BASE_PRODUCT,
    });

    return baseProduct;
  }

  async listPlans(): Promise<BillingGetPlanResult[]> {
    const planKeys = Object.values(BillingPlanKey);

    const products = await this.billingProductRepository.find({
      where: {
        active: true,
        billingPrices: {
          active: true,
        },
      },
      relations: ['billingPrices.billingProduct'],
    });

    return planKeys.map((planKey) => {
      const planProducts = products.filter(
        (product) => product.metadata.planKey === planKey,
      );

      const meteredProducts = planProducts.filter(
        (product) =>
          product.metadata.priceUsageBased === BillingUsageType.METERED,
      );
      const licensedProducts = planProducts.filter(
        (product) =>
          product.metadata.priceUsageBased === BillingUsageType.LICENSED,
      );

      return {
        planKey,
        meteredProducts,
        licensedProducts,
      };
    });
  }

  async getPlanByPriceId(stripePriceId: string) {
    const plans = await this.listPlans();

    return findOrThrow(plans, (plan) => {
      return (
        plan.meteredProducts.some((product) =>
          product.billingPrices.some(
            (price) => price.stripePriceId === stripePriceId,
          ),
        ) ||
        plan.licensedProducts.some((product) =>
          product.billingPrices.some(
            (price) => price.stripePriceId === stripePriceId,
          ),
        )
      );
    });
  }

  async getPricesPerPlanByInterval({
    planKey,
    interval,
  }: {
    planKey: BillingPlanKey;
    interval: SubscriptionInterval;
  }): Promise<BillingGetPricesPerPlanResult> {
    const plans = await this.listPlans();
    const plan = plans.find((plan) => plan.planKey === planKey);

    if (!plan) {
      throw new BillingException(
        'Billing plan not found',
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }
    const { meteredProducts, licensedProducts } = plan;

    const filterPricesByInterval = (product: BillingProductEntity) =>
      product.billingPrices.filter((price) => price.interval === interval);

    const meteredProductsPrices = meteredProducts.flatMap(
      filterPricesByInterval,
    );
    const licensedProductsPrices = licensedProducts.flatMap(
      filterPricesByInterval,
    );

    return {
      meteredProductsPrices,
      licensedProductsPrices,
    };
  }

  async getPlanDetails(planKey: BillingPlanKey): Promise<PlanDetails> {
    const features = BILLING_PLAN_FEATURES[planKey];
    const prices = BILLING_PRICES_DISPLAY_MXN[planKey];

    if (!features || !prices) {
      throw new BillingException(
        `Plan ${planKey} not found`,
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }

    return {
      planKey,
      name: features.name,
      description: features.description,
      features: features.features,
      limits: features.limits,
      prices: {
        monthly: {
          amount: prices.monthly.amount,
          currency: prices.monthly.currency,
          formatted: prices.monthly.formatted,
          savings: 'savings' in prices.monthly ? (prices.monthly as Record<string, unknown>).savings as string : undefined,
        },
        yearly: {
          amount: prices.yearly.amount,
          currency: prices.yearly.currency,
          formatted: prices.yearly.formatted,
          savings: 'savings' in prices.yearly ? (prices.yearly as Record<string, unknown>).savings as string : undefined,
        },
      },
    };
  }

  async listPlanDetails(): Promise<PlanDetails[]> {
    const planKeys = Object.values(BillingPlanKey);
    const planDetails: PlanDetails[] = [];

    for (const planKey of planKeys) {
      const details = await this.getPlanDetails(planKey);
      planDetails.push(details);
    }

    return planDetails;
  }
}
