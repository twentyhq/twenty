/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
@Injectable()
export class BillingProductService {
  protected readonly logger = new Logger(BillingProductService.name);
  constructor(private readonly billingPlanService: BillingPlanService) {}

  getProductPricesByInterval({
    interval,
    billingProductsByPlan,
  }: {
    interval: SubscriptionInterval;
    billingProductsByPlan: BillingProduct[];
  }): BillingPrice[] {
    const billingPrices = billingProductsByPlan.flatMap((product) =>
      product.billingPrices.filter(
        (price) => price.interval === interval && price.active,
      ),
    );

    return billingPrices;
  }

  async getProductsByPlan(planKey: BillingPlanKey): Promise<BillingProduct[]> {
    const products = await this.billingPlanService.getPlans();
    const plan = products.find((product) => product.planKey === planKey);

    if (!plan) {
      throw new BillingException(
        `Plan ${planKey} not found`,
        BillingExceptionCode.BILLING_PLAN_NOT_FOUND,
      );
    }

    return [plan.baseProduct, ...plan.meteredProducts];
  }
}
