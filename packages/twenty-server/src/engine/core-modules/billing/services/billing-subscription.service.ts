import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import Stripe from 'stripe';
import { Not, Repository } from 'typeorm';

import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripePriceService: StripePriceService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
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
      await this.stripeSubscriptionService.cancelSubscription(
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
      await this.stripeSubscriptionService.collectLastInvoice(
        billingSubscription.stripeSubscriptionId,
      );
    }

    return {
      handleUnpaidInvoiceStripeSubscriptionId:
        billingSubscription.stripeSubscriptionId,
    };
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

  async applyBillingSubscription(workspace: Workspace) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );

    const newInterval =
      billingSubscription?.interval === SubscriptionInterval.Year
        ? SubscriptionInterval.Month
        : SubscriptionInterval.Year;

    const billingSubscriptionItem =
      await this.getCurrentBillingSubscriptionItemOrThrow(workspace.id);

    const productPrice = await this.stripePriceService.getStripePrice(
      AvailableProduct.BasePlan,
      newInterval,
    );

    if (!productPrice) {
      throw new Error(
        `Cannot find product price for product ${AvailableProduct.BasePlan} and interval ${newInterval}`,
      );
    }

    await this.stripeSubscriptionItemService.updateBillingSubscriptionItem(
      billingSubscriptionItem,
      productPrice.stripePriceId,
    );
  }
}
