/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { getPlanKeyFromSubscription } from 'src/engine/core-modules/billing/utils/get-plan-key-from-subscription.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingProductService: BillingProductService,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  isBillingEnabled() {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceAnySubscription(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { workspaceId },
    });

    return isDefined(subscription);
  }

  async hasEntitlement(
    workspaceId: string,
    entitlementKey: BillingEntitlementKey,
  ) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    return this.billingSubscriptionService.getWorkspaceEntitlementByKey(
      workspaceId,
      entitlementKey,
    );
  }

  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    const hasAnySubscription =
      await this.hasWorkspaceAnySubscription(workspaceId);

    return !hasAnySubscription;
  }

  async canBillMeteredProduct(
    workspaceId: string,
    productKey: BillingProductKey,
  ): Promise<boolean> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    const billableStatuses = [
      SubscriptionStatus.Active,
      SubscriptionStatus.Trialing,
    ];

    if (!billableStatuses.includes(subscription.status)) {
      return false;
    }

    const planKey = getPlanKeyFromSubscription(subscription);
    const products =
      await this.billingProductService.getProductsByPlan(planKey);

    const targetProduct = products.find(
      ({ metadata }) => metadata.productKey === productKey,
    );

    if (!targetProduct) {
      return false;
    }

    const subscriptionItem = subscription.billingSubscriptionItems.find(
      (item) => item.stripeProductId === targetProduct.stripeProductId,
    );

    return subscriptionItem?.hasReachedCurrentPeriodCap === false;
  }
}
