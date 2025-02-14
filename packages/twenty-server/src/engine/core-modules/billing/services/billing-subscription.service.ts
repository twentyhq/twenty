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
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { AvailableProduct } from 'src/engine/core-modules/billing/enums/billing-available-product.enum';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { StripePriceService } from 'src/engine/core-modules/billing/stripe/services/stripe-price.service';
import { StripeSubscriptionItemService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-item.service';
import { StripeSubscriptionService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeSubscriptionService: StripeSubscriptionService,
    private readonly stripePriceService: StripePriceService,
    private readonly stripeSubscriptionItemService: StripeSubscriptionItemService,
    private readonly billingPlanService: BillingPlanService,
    private readonly environmentService: EnvironmentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingProductService: BillingProductService,
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

  async getBaseProductCurrentBillingSubscriptionItemOrThrow(
    workspaceId: string,
    stripeBaseProductId = this.environmentService.get(
      'BILLING_STRIPE_BASE_PLAN_PRODUCT_ID',
    ),
  ) {
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspaceId,
      );

    const billingSubscription = await this.getCurrentBillingSubscriptionOrThrow(
      { workspaceId },
    );

    const getStripeProductId = isBillingPlansEnabled
      ? (await this.billingPlanService.getPlanBaseProduct(BillingPlanKey.PRO))
          ?.stripeProductId
      : stripeBaseProductId;

    if (!getStripeProductId) {
      throw new BillingException(
        'Base product not found',
        BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND,
      );
    }

    const billingSubscriptionItem =
      billingSubscription.billingSubscriptionItems.filter(
        (billingSubscriptionItem) =>
          billingSubscriptionItem.stripeProductId === getStripeProductId,
      )?.[0];

    if (!billingSubscriptionItem) {
      throw new Error(
        `Cannot find billingSubscriptionItem for product ${getStripeProductId} for workspace ${workspaceId}`,
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
    const isBillingPlansEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsBillingPlansEnabled,
        workspace.id,
      );
    const newInterval =
      billingSubscription?.interval === SubscriptionInterval.Year
        ? SubscriptionInterval.Month
        : SubscriptionInterval.Year;

    const billingBaseProductSubscriptionItem =
      await this.getBaseProductCurrentBillingSubscriptionItemOrThrow(
        workspace.id,
      );

    if (isBillingPlansEnabled) {
      const billingProductsByPlan =
        await this.billingProductService.getProductsByPlan(BillingPlanKey.PRO);
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
    } else {
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
        billingBaseProductSubscriptionItem,
        productPrice.stripePriceId,
      );
    }
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
}
