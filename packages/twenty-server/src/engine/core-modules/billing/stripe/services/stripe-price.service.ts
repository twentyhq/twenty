import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { ProductPriceEntity } from 'src/engine/core-modules/billing/dto/product-price.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class StripePriceService {
  protected readonly logger = new Logger(StripePriceService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.environmentService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async getStripePrices(product: AvailableProduct) {
    const stripeProductId = this.getStripeProductId(product);

    const prices = await this.stripe.prices.search({
      query: `product: '${stripeProductId}'`,
    });

    return this.formatProductPrices(prices.data);
  }

  async getStripePrice(product: AvailableProduct, recurringInterval: string) {
    const productPrices = await this.getStripePrices(product);

    return productPrices.find(
      (price) => price.recurringInterval === recurringInterval,
    );
  }

  getStripeProductId(product: AvailableProduct) {
    if (product === AvailableProduct.BasePlan) {
      return this.environmentService.get('BILLING_STRIPE_BASE_PLAN_PRODUCT_ID');
    }
  } // PD:,will be eliminated after refactoring

  formatProductPrices(prices: Stripe.Price[]): ProductPriceEntity[] {
    const productPrices: ProductPriceEntity[] = Object.values(
      prices
        .filter((item) => item.recurring?.interval && item.unit_amount)
        .reduce((acc, item: Stripe.Price) => {
          const interval = item.recurring?.interval;

          if (!interval || !item.unit_amount) {
            return acc;
          }

          if (!acc[interval] || item.created > acc[interval].created) {
            acc[interval] = {
              unitAmount: item.unit_amount,
              recurringInterval: interval,
              created: item.created,
              stripePriceId: item.id,
            };
          }

          return acc satisfies Record<string, ProductPriceEntity>;
        }, {}),
    );

    return productPrices.sort((a, b) => a.unitAmount - b.unitAmount);
  }

  async getPricesByProductId(productId: string) {
    const prices = await this.stripe.prices.search({
      query: `product:'${productId}'`,
    });

    return prices.data;
  }
}
