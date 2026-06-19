/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Not } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingProductService: BillingProductService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
  ) {}

  isBillingEnabled() {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceAnySubscription(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      { where: {} },
    );

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

  // Onboarding must not proceed past the payment step until the workspace has a
  // usable subscription. A subscription is NOT usable when it is still
  // incomplete (an immediate first payment never went through) or when it is
  // waiting for the customer to confirm a required payment method (a
  // card-required trial whose SetupIntent has not been confirmed). Checking
  // mere existence is insufficient: the inline payment flow persists a
  // `trialing` subscription before the card is confirmed, so a failed card
  // would otherwise let the user skip payment by refreshing.
  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    if (!this.isBillingEnabled()) {
      return false;
    }

    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      {
        where: { status: Not(SubscriptionStatus.Canceled) },
        order: { createdAt: 'DESC' },
      },
    );

    if (!isDefined(subscription)) {
      return true;
    }

    if (
      subscription.status === SubscriptionStatus.Incomplete ||
      subscription.status === SubscriptionStatus.IncompleteExpired
    ) {
      return true;
    }

    return isDefined(subscription.stripePendingSetupIntentId);
  }
}
