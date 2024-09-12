import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { User } from '@sentry/node';
import Stripe from 'stripe';
import { In, Not, Repository } from 'typeorm';

import { AvailableProduct } from 'src/engine/core-modules/billing/interfaces/available-product.interface';

import {
  BillingSubscription,
  SubscriptionInterval,
  SubscriptionStatus,
} from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class BillingSubscriptionService {
  protected readonly logger = new Logger(BillingSubscriptionService.name);
  constructor(
    private readonly stripeService: StripeService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  /**
   * @deprecated This is fully deprecated, it's only used in the migration script for 0.23
   */
  async getActiveSubscriptionWorkspaceIds() {
    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return (await this.workspaceRepository.find({ select: ['id'] })).map(
        (workspace) => workspace.id,
      );
    }

    const activeSubscriptions = await this.billingSubscriptionRepository.find({
      where: {
        status: In([
          SubscriptionStatus.Active,
          SubscriptionStatus.Trialing,
          SubscriptionStatus.PastDue,
        ]),
      },
      select: ['workspaceId'],
    });

    const freeAccessFeatureFlags = await this.featureFlagRepository.find({
      where: {
        key: FeatureFlagKey.IsFreeAccessEnabled,
        value: true,
      },
      select: ['workspaceId'],
    });

    const activeWorkspaceIdsBasedOnSubscriptions = activeSubscriptions.map(
      (subscription) => subscription.workspaceId,
    );

    const activeWorkspaceIdsBasedOnFeatureFlags = freeAccessFeatureFlags.map(
      (featureFlag) => featureFlag.workspaceId,
    );

    return Array.from(
      new Set([
        ...activeWorkspaceIdsBasedOnSubscriptions,
        ...activeWorkspaceIdsBasedOnFeatureFlags,
      ]),
    );
  }

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
