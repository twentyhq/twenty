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
}
