import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { User } from '@sentry/node';
import Stripe from 'stripe';
import { Not, Repository } from 'typeorm';

import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingEntitlement, 'core')
    private readonly billingEntitlementRepository: Repository<BillingEntitlement>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
  ) {}

  async getCurrentBillingSubscriptionOrThrow(criteria: {
    workspaceId?: string;
    stripeCustomerId?: string;
  }) {
    const notCanceledSubscriptions =
      await this.billingSubscriptionRepository.find({
        where: { ...criteria, status: Not(SubscriptionStatus.Canceled) },
        relations: ['billingSubscriptionItems'],
      });

    assert(
      notCanceledSubscriptions.length <= 1,
      `More than one not canceled subscription for workspace ${criteria.workspaceId}`,
    );

    return notCanceledSubscriptions?.[0];
  }

  async getCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
    stripeProductId = this.environmentService.get(
      'BILLING_STRIPE_BASE_PLAN_PRODUCT_ID',
    ),
  ) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.filter(
        (billingSubscriptionItem) =>
          billingSubscriptionItem.stripeProductId === stripeProductId,
      )?.[0];

    if (!billingSubscriptionItem) {
      throw new Error(
        `Cannot find billingSubscriptionItem for product ${stripeProductId} for workspace ${workspaceId}`,
      );
    }

    return billingSubscriptionItem;
  }

  async deleteSubscription(workspaceId: string) {
    const subscriptionToCancel =
      await this.getCurrentBillingSubscriptionOrThrow({
        workspaceId,
      });

    if (subscriptionToCancel) {
      await this.stripeService.cancelSubscription(
        subscriptionToCancel.stripeSubscriptionId,
      );
      await this.billingSubscriptionRepository.delete(subscriptionToCancel.id);
    }
  }

  async handleUnpaidInvoices(data: Stripe.SetupIntentSucceededEvent.Data) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { stripeCustomerId: data.object.customer as string },
    );

    if (billingSubscription?.status === 'unpaid') {
      await this.stripeService.collectLastInvoice(
        billingSubscription.stripeSubscriptionId,
      );
    }
  }

  async getWorkspaceEntitlementByKey(
    workspaceId: string,
    key: BillingEntitlementKey,
  ) {
    const entitlement = await this.billingEntitlementRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    if (!entitlement) {
      return false;
    }

    return entitlement.value;
  }

  async applyBillingSubscription(user: User) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: user.defaultWorkspaceId },
    );

    const newInterval =
      billingSubscription?.interval === SubscriptionInterval.Year
        ? SubscriptionInterval.Month
        : SubscriptionInterval.Year;

    const billingSubscriptionItem =
      await this.getCurrentBillingSubscriptionItemOrThrow(
        user.defaultWorkspaceId,
      );

    const productPrice = await this.stripeService.getStripePrice(
      AvailableProduct.BasePlan,
      newInterval,
    );

    if (!productPrice) {
      throw new Error(
        `Cannot find product price for product ${AvailableProduct.BasePlan} and interval ${newInterval}`,
      );
    }

    await this.stripeService.updateBillingSubscriptionItem(
      billingSubscriptionItem,
      productPrice.stripePriceId,
    );
  }
}
