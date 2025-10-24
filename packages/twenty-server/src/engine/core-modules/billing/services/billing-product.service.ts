/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';

@Injectable()
export class BillingProductService {
  protected readonly logger = new Logger(BillingProductService.name);
  constructor(private readonly billingPlanService: BillingPlanService) {}

  async getProductPrices({
    interval,
    planKey,
  }: {
    interval: SubscriptionInterval;
    planKey: BillingPlanKey;
  }): Promise<BillingPriceEntity[]> {
    const billingProducts = await this.getProductsByPlan(planKey);

    return this.getProductPricesByInterval({
      interval,
      billingProductsByPlan: billingProducts,
    });
  }

  private getProductPricesByInterval({
    interval,
    billingProductsByPlan,
  }: {
    interval: SubscriptionInterval;
    billingProductsByPlan: BillingProductEntity[];
  }): BillingPriceEntity[] {
    return billingProductsByPlan.flatMap((product) =>
      product.billingPrices.filter(
        (price) => price.interval === interval && price.active,
      ),
    );
  }

  async getProductsByPlan(
    planKey: BillingPlanKey,
  ): Promise<BillingProductEntity[]> {
    const products = await this.billingPlanService.listPlans();
    const plan = products.find((product) => product.planKey === planKey);

    if (!plan) {
      throw new BillingException(
        `Plan ${planKey} not found`,
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }

    return [...plan.licensedProducts, ...plan.meteredProducts];
  }
}
