/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingProductService: BillingProductService,
    private readonly stripeCustomerService: StripeCustomerService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
  ) {}

  isBillingEnabled() {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async ensureBillingCustomer({
    userEmail,
    workspaceId,
    workspaceDisplayName,
  }: {
    userEmail: string;
    workspaceId: string;
    workspaceDisplayName: string | undefined;
  }): Promise<void> {
    const existingBillingCustomer =
      await this.billingCustomerRepository.findOne(workspaceId, { where: {} });

    if (isDefined(existingBillingCustomer)) {
      return;
    }

    await this.stripeCustomerService.createStripeCustomer(
      userEmail,
      workspaceId,
      workspaceDisplayName,
    );
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

  async isPayingCustomer(workspaceId: string) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    if (
      currentBillingSubscription === NO_BILLING_SUBSCRIPTION ||
      currentBillingSubscription.status !== SubscriptionStatus.Active
    ) {
      return false;
    }

    const { billingCustomerPaymentStatus } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingCustomerPaymentStatus',
      ]);

    return (
      billingCustomerPaymentStatus.hasPaymentMethod &&
      billingCustomerPaymentStatus.hasReceivedPayment
    );
  }

  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    const hasAnySubscription =
      await this.hasWorkspaceAnySubscription(workspaceId);

    return !hasAnySubscription;
  }
}
