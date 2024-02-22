import { Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type PriceData = Record<Stripe.Price.Recurring.Interval, Stripe.Price>;
export enum AvailableProducts {
  Subscription = 'subscription',
}

@Injectable()
export class BillingService {
  constructor(private readonly environmentService: EnvironmentService) {}

  getProductStripeId(product: AvailableProducts) {
    if (product === AvailableProducts.Subscription) {
      return this.environmentService.getStripeSubscriptionProductId();
    }
  }

  formatProductPrices(prices: Stripe.Price[]) {
    const mostRecentPricesPerRecurringInterval = {} as PriceData;

    prices.forEach((item) => {
      const recurringInterval = item.recurring?.interval;

      if (!recurringInterval) {
        return;
      }
      if (
        !mostRecentPricesPerRecurringInterval[recurringInterval] ||
        item.created >
          mostRecentPricesPerRecurringInterval[recurringInterval].created
      ) {
        mostRecentPricesPerRecurringInterval[recurringInterval] = item;
      }
    });

    return mostRecentPricesPerRecurringInterval;
  }
}
