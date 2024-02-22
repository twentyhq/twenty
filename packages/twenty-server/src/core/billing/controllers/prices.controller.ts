import { Controller, Get } from '@nestjs/common';

import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

type PriceData = Record<Stripe.Price.Recurring.Interval, Stripe.Price>;

@Controller('stripe/prices')
export class PricesController {
  constructor(
    @InjectStripeClient()
    private readonly stripeClient: Stripe,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Get()
  async getPrices(): Promise<PriceData> {
    const stripeSubscriptionProductId =
      this.environmentService.getStripeSubscriptionProductId();

    const subscriptionProductPrices = await this.stripeClient.prices.search({
      query: `product: '${stripeSubscriptionProductId}'`,
      expand: ['data.product'],
    });

    const mostRecentPricesPerRecurringInterval = {} as PriceData;

    subscriptionProductPrices.data.forEach((item) => {
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
