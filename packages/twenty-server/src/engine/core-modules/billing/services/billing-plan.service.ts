/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

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
import { assertPlanIsSellableOrThrow } from 'src/engine/core-modules/billing/utils/assert-plan-is-sellable-or-throw.util';
import { findDefaultPlanKey } from 'src/engine/core-modules/billing/utils/find-default-plan-key.util';
import { getBillingPlanConfig } from 'src/engine/core-modules/billing/utils/get-billing-plan-config.util';
import { getSellablePlanKeys } from 'src/engine/core-modules/billing/utils/get-sellable-plan-keys.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class BillingPlanService {
  protected readonly logger = new Logger(BillingPlanService.name);
  constructor(
    @InjectRepository(BillingProductEntity)
    private readonly billingProductRepository: Repository<BillingProductEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async listPlans(): Promise<BillingGetPlanResult[]> {
    const plansConfig = this.twentyConfigService.get('BILLING_PLANS');
    const sellablePlanKeys = getSellablePlanKeys(plansConfig);
    const defaultPlanKey = findDefaultPlanKey(plansConfig);
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
      const baseProducts = planProducts.filter(
        (product) =>
          product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
      );
      const resourceCreditProducts = planProducts.filter(
        (product) =>
          product.metadata.productKey === BillingProductKey.RESOURCE_CREDIT,
      );
      const { upgradePlanKeys, downgradePlanKeys } = getBillingPlanConfig({
        plansConfig,
        planKey,
      });

      return {
        planKey,
        isSellable: sellablePlanKeys.includes(planKey),
        isCheckoutDefault: planKey === defaultPlanKey,
        upgradePlanKeys,
        downgradePlanKeys,
        meteredProducts,
        baseProducts,
        resourceCreditProducts,
      };
    });
  }

  async getSellablePlanPricesByIntervalOrThrow({
    planKey,
    interval,
  }: {
    planKey: BillingPlanKey;
    interval: SubscriptionInterval;
  }): Promise<BillingGetPricesPerPlanResult> {
    assertPlanIsSellableOrThrow({
      planKey,
      sellablePlanKeys: getSellablePlanKeys(
        this.twentyConfigService.get('BILLING_PLANS'),
      ),
    });

    const plans = await this.listPlans();
    const plan = plans.find((plan) => plan.planKey === planKey);

    if (!plan) {
      throw new BillingException(
        'Billing plan not found',
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }
    const { meteredProducts, baseProducts, resourceCreditProducts } = plan;

    const filterPricesByInterval = (product: BillingProductEntity) =>
      product.billingPrices.filter((price) => price.interval === interval);

    const meteredProductPrices = meteredProducts.flatMap(
      filterPricesByInterval,
    );
    const baseProductPrices = baseProducts.flatMap(filterPricesByInterval);

    const resourceCreditProductPrices = resourceCreditProducts.flatMap(
      filterPricesByInterval,
    );

    return {
      meteredProductPrices,
      baseProductPrices,
      resourceCreditProductPrices,
    };
  }
}
