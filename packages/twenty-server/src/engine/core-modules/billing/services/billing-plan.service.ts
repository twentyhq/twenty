/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JsonContains, Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingGetPlanResult } from 'src/engine/core-modules/billing/types/billing-get-plan-result.type';
import { BillingGetPricesPerPlanResult } from 'src/engine/core-modules/billing/types/billing-get-prices-per-plan-result.type';

@Injectable()
export class BillingPlanService {
  protected readonly logger = new Logger(BillingPlanService.name);
  constructor(
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
  ) {}

  async getProductsByProductMetadata({
    planKey,
    priceUsageBased,
    productKey,
  }: {
    planKey: BillingPlanKey;
    priceUsageBased: BillingUsageType;
    productKey: BillingProductKey;
  }): Promise<BillingProduct[]> {
    const products = await this.billingProductRepository.find({
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

    return products;
  }

  async getPlanBaseProduct(planKey: BillingPlanKey): Promise<BillingProduct> {
    const [baseProduct] = await this.getProductsByProductMetadata({
      planKey,
      priceUsageBased: BillingUsageType.LICENSED,
      productKey: BillingProductKey.BASE_PRODUCT,
    });

    return baseProduct;
  }

  async getPlans(): Promise<BillingGetPlanResult[]> {
    const planKeys = Object.values(BillingPlanKey);

    const products = await this.billingProductRepository.find({
      where: {
        active: true,
      },
      relations: ['billingPrices.billingProduct'],
    });

    return planKeys.map((planKey) => {
      const planProducts = products
        .filter((product) => product.metadata.planKey === planKey)
        .map((product) => {
          return {
            ...product,
            billingPrices: product.billingPrices.filter(
              (price) => price.active,
            ),
          };
        });
      const baseProduct = planProducts.find(
        (product) =>
          product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
      );

      if (!baseProduct) {
        throw new BillingException(
          'Base product not found, did you run the billing:sync-plans-data command?',
          BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
        );
      }

      const meteredProducts = planProducts.filter(
        (product) =>
          product.metadata.priceUsageBased === BillingUsageType.METERED,
      );
      const otherLicensedProducts = planProducts.filter(
        (product) =>
          product.metadata.priceUsageBased === BillingUsageType.LICENSED &&
          product.metadata.productKey !== BillingProductKey.BASE_PRODUCT,
      );

      return {
        planKey,
        baseProduct,
        meteredProducts,
        otherLicensedProducts,
      };
    });
  }

  async getPricesPerPlan({
    planKey,
    interval,
  }: {
    planKey: BillingPlanKey;
    interval: SubscriptionInterval;
  }): Promise<BillingGetPricesPerPlanResult> {
    const plans = await this.getPlans();
    const plan = plans.find((plan) => plan.planKey === planKey);

    if (!plan) {
      throw new BillingException(
        'Billing plan not found',
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }
    const { baseProduct, meteredProducts, otherLicensedProducts } = plan;
    const baseProductPrice = baseProduct.billingPrices.find(
      (price) => price.interval === interval && price.active,
    );

    if (!baseProductPrice) {
      throw new BillingException(
        'Base product active price not found for given interval',
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }
    const filterPricesByInterval = (product: BillingProduct) =>
      product.billingPrices.filter(
        (price) => price.interval === interval && price.active,
      );

    const meteredProductsPrices = meteredProducts.flatMap(
      filterPricesByInterval,
    );
    const otherLicensedProductsPrices = otherLicensedProducts.flatMap(
      filterPricesByInterval,
    );

    return {
      baseProductPrice,
      meteredProductsPrices,
      otherLicensedProductsPrices,
    };
  }
}
