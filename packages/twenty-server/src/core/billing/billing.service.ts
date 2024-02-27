import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { StripeService } from 'src/core/billing/stripe/stripe.service';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';

export enum AvailableProduct {
  BasePlan = 'base-plan',
}

export enum WebhookEvent {
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
}

@Injectable()
export class BillingService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingSubscriptionItem, 'core')
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItem>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
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
    const result: Record<string, Stripe.Price> = {};

    prices.forEach((item) => {
      const interval = item.recurring?.interval;

      if (!interval) {
        return;
      }
      if (
        !result[interval] ||
        item.created > (result[interval]?.created || 0)
      ) {
        result[interval] = item;
      }
    });

    return Object.values(result);
  }

  async createBillingSubscription(
    workspaceId: string,
    data: Stripe.CustomerSubscriptionUpdatedEvent.Data,
  ) {
    const billingSubscription = this.billingSubscriptionRepository.create({
      workspaceId: workspaceId,
      stripeCustomerId: data.object.customer as string,
      stripeSubscriptionId: data.object.id,
      status: data.object.status,
    });

    await this.billingSubscriptionRepository.save(billingSubscription);

    for (const item of data.object.items.data) {
      const billingSubscriptionItem =
        this.billingSubscriptionItemRepository.create({
          billingSubscriptionId: billingSubscription.id,
          stripeSubscriptionItemId: item.id,
          stripeProductId: item.price.product as string,
          stripePriceId: item.price.id,
          quantity: item.quantity,
        });

      await this.billingSubscriptionItemRepository.save(
        billingSubscriptionItem,
      );
    }
    await this.workspaceRepository.update(workspaceId, {
      subscriptionStatus: 'active',
    });
  }

  async updateBillingSubscriptionQuantity(
    workspaceId: string,
    increment: 1 | -1,
  ) {
    const billingSubscription =
      await this.billingSubscriptionRepository.findOneOrFail({
        where: { workspaceId },
        relations: ['billingSubscriptionItems'],
      });

    const basePlanProductIt =
      this.environmentService.getBillingStripeBasePlanProductId();

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.filter(
        (billingSubscriptionItem) =>
          billingSubscriptionItem.stripeProductId === basePlanProductIt,
      )?.[0];

    if (!billingSubscriptionItem) {
      throw new Error(
        `Cannot find billingSubscriptionItem for product ${basePlanProductIt} for workspace ${workspaceId}`,
      );
    }

    const newQuantity = billingSubscriptionItem.quantity + increment;

    await this.stripeService.stripe.subscriptionItems.update(
      billingSubscriptionItem.stripeSubscriptionItemId,
      { quantity: newQuantity },
    );
    await this.billingSubscriptionItemRepository.update(
      billingSubscriptionItem.id,
      { quantity: newQuantity },
    );
  }
}
