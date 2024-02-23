import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';

export type PriceData = Partial<
  Record<Stripe.Price.Recurring.Interval, Stripe.Price>
>;
export enum AvailableProduct {
  BasePlan = 'base-plan',
}
export enum RecurringInterval {
  MONTH = 'month',
  YEAR = 'year',
}
@Injectable()
export class BillingService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly environmentService: EnvironmentService,
  ) {}

  getProductStripeId(product: AvailableProduct) {
    if (product === AvailableProduct.BasePlan) {
      return this.environmentService.getBillingStripeBasePlanProductId();
    }
  }

  async getProductPrices(stripeProductId: string) {
    const productPrices = await this.stripeService.stripe.prices.search({
      query: `product: '${stripeProductId}'`,
    });

    return this.formatProductPrices(productPrices.data);
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
