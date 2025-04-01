/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import Stripe from 'stripe';
import { Not, Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingUsageType } from 'src/engine/core-modules/billing/enums/billing-usage-type.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly billingPlanService: BillingPlanService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingEntitlement, 'core')
    private readonly billingEntitlementRepository: Repository<BillingEntitlement>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(BillingProduct, 'core')
    private readonly billingProductRepository: Repository<BillingProduct>,
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

  async getBaseProductCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
  ) {
    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const planKey = getPlanKeyFromSubscription(billingSubscription);

    const baseProduct =
      await this.billingPlanService.getPlanBaseProduct(planKey);

    if (!baseProduct) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    const stripeProductId = baseProduct.stripeProductId;

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

  async deleteSubscriptions(workspaceId: string) {
    const subscriptionToCancel =
      await this.getCurrentBillingSubscriptionOrThrow({
        workspaceId,
      });

    if (subscriptionToCancel) {
      await this.stripeSubscriptionService.cancelSubscription(
        subscriptionToCancel.stripeSubscriptionId,
      );
    }
    await this.billingSubscriptionRepository.delete({ workspaceId });
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
        billingSubscription?.stripeSubscriptionId,
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

    const planKey = getPlanKeyFromSubscription(billingSubscription);
    const billingProductsByPlan =
      await this.billingProductService.getProductsByPlan(planKey);
    const pricesPerPlanArray =
      this.billingProductService.getProductPricesByInterval({
        interval: newInterval,
        billingProductsByPlan,
      });

    const subscriptionItemsToUpdate = this.getSubscriptionItemsToUpdate(
      billingSubscription,
      pricesPerPlanArray,
    );

    await this.stripeSubscriptionService.updateSubscriptionItems(
      billingSubscription.stripeSubscriptionId,
      subscriptionItemsToUpdate,
    );
  }

  private getSubscriptionItemsToUpdate(
    billingSubscription: BillingSubscription,
    billingPricesPerPlanAndIntervalArray: BillingPrice[],
  ): BillingSubscriptionItem[] {
    const subscriptionItemsToUpdate =
      billingSubscription.billingSubscriptionItems.map((subscriptionItem) => {
        const matchingPrice = billingPricesPerPlanAndIntervalArray.find(
          (price) => price.stripeProductId === subscriptionItem.stripeProductId,
        );

        if (!matchingPrice) {
          throw new BillingException(
            `Cannot find matching price for product ${subscriptionItem.stripeProductId}`,
            BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
          );
        }

        return {
          ...subscriptionItem,
          stripePriceId: matchingPrice.stripePriceId,
        };
      });

    return subscriptionItemsToUpdate;
  }

  async convertTrialSubscriptionToSubscriptionWithMeteredProducts(
    billingSubscription: BillingSubscription,
  ) {
    const meteredProducts = (
      await this.billingProductRepository.find({
        where: {
          active: true,
        },
        relations: ['billingPrices'],
      })
    ).filter(
      (product) =>
        product.metadata.priceUsageBased === BillingUsageType.METERED,
    );

    // subscription update to enable metered product billing
    await this.stripeSubscriptionService.updateSubscription(
      billingSubscription.stripeSubscriptionId,
      {
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
      },
    );

    for (const meteredProduct of meteredProducts) {
      const meteredProductPrice = meteredProduct.billingPrices.find(
        (price) => price.active,
      );

      if (!meteredProductPrice) {
        throw new BillingException(
          `Cannot find active price for product ${meteredProduct.id}`,
          BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
        );
      }

      await this.stripeSubscriptionItemService.createSubscriptionItem(
        billingSubscription.stripeSubscriptionId,
        meteredProductPrice.stripePriceId,
      );
    }
  }
}
