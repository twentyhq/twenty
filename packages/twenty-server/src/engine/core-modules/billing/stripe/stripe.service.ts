import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { ProductPriceEntity } from 'src/engine/core-modules/billing/dto/product-price.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';

@Injectable()
export class StripeService {
  protected readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
  ) {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = new Stripe(
      this.environmentService.get('BILLING_STRIPE_API_KEY'),
      {},
    );
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.environmentService.get(
      'BILLING_STRIPE_WEBHOOK_SECRET',
    );

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
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
  }

  async updateSubscriptionItem(stripeItemId: string, quantity: number) {
    await this.stripe.subscriptionItems.update(stripeItemId, { quantity });
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  async createBillingPortalSession(
    stripeCustomerId: string,
    returnUrl?: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url:
        returnUrl ?? this.domainManagerService.getBaseUrl().toString(),
    });
  }

  async createCheckoutSession(
    user: User,
    priceId: string,
    quantity: number,
    successUrl?: string,
    cancelUrl?: string,
    stripeCustomerId?: string,
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          workspaceId: user.defaultWorkspaceId,
        },
        trial_period_days: this.environmentService.get(
          'BILLING_FREE_TRIAL_DURATION_IN_DAYS',
        ),
      },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      customer: stripeCustomerId,
      customer_update: stripeCustomerId ? { name: 'auto' } : undefined,
      customer_email: stripeCustomerId ? undefined : user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async collectLastInvoice(stripeSubscriptionId: string) {
    const subscription = await this.stripe.subscriptions.retrieve(
      stripeSubscriptionId,
      { expand: ['latest_invoice'] },
    );
    const latestInvoice = subscription.latest_invoice;

    if (
      !(
        latestInvoice &&
        typeof latestInvoice !== 'string' &&
        latestInvoice.status === 'draft'
      )
    ) {
      return;
    }
    await this.stripe.invoices.pay(latestInvoice.id);
  }

  async updateBillingSubscriptionItem(
    stripeSubscriptionItem: BillingSubscriptionItem,
    stripePriceId: string,
  ) {
    await this.stripe.subscriptionItems.update(
      stripeSubscriptionItem.stripeSubscriptionItemId,
      {
        price: stripePriceId,
        quantity: stripeSubscriptionItem.quantity,
      },
    );
  }

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
}
