import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type PriceData = Partial<
  Record<Stripe.Price.Recurring.Interval, Stripe.Price>
>;
export enum AvailableProduct {
  BasePlan = 'base-plan',
}

@Injectable()
export class BillingService {
  constructor(private readonly environmentService: EnvironmentService) {}

  getProductStripeId(product: AvailableProduct) {
    if (product === AvailableProduct.BasePlan) {
      return this.environmentService.getBillingStripeBasePlanProductId();
    }
  }

  formatProductPrices(prices: Stripe.Price[]) {
    const result: PriceData = {};

    prices.forEach((item) => {
      const recurringInterval = item.recurring?.interval;

      if (!recurringInterval) {
        return;
      }
      if (
        !result[recurringInterval] ||
        item.created > (result[recurringInterval]?.created || 0)
      ) {
        result[recurringInterval] = item;
      }
    });

    return result;
  }
}
