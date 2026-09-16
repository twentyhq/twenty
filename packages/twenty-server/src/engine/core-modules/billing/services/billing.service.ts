/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { PLAN_REQUIRED_SATISFYING_SUBSCRIPTION_STATUSES } from 'src/engine/core-modules/billing/constants/plan-required-satisfying-subscription-statuses.constant';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
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
    private readonly stripeCustomerService: StripeCustomerService,
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

  async isSubscriptionIncompleteOnboardingStatus(workspaceId: string) {
    const hasAnySubscription =
      await this.hasWorkspaceAnySubscription(workspaceId);

    return !hasAnySubscription;
  }

  /**
   * True when the workspace has a subscription status that satisfies the API
   * plan gate (active/trialing/past_due/unpaid). Incomplete checkout rows do
   * NOT count — otherwise createSubscriptionPaymentIntent unlocks CRM before
   * payment succeeds. Intentionally stricter than onboarding PLAN_REQUIRED
   * (any row); front ErrorLink maps 402 → /plan-required.
   */
  async hasWorkspaceRequiredPlanSubscription(
    workspaceId: string,
  ): Promise<boolean> {
    if (!this.isBillingEnabled()) {
      return true;
    }

    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      {
        where: {
          status: In(PLAN_REQUIRED_SATISFYING_SUBSCRIPTION_STATUSES),
        },
      },
    );

    return isDefined(subscription);
  }

  /**
   * Throws when cloud billing is enabled and the workspace lacks an
   * active/trialing/past_due/unpaid subscription.
   * No-op when IS_BILLING_ENABLED is false (self-host).
   */
  async assertWorkspaceHasRequiredPlan(workspaceId: string): Promise<void> {
    if (!this.isBillingEnabled()) {
      return;
    }

    if (!(await this.hasWorkspaceRequiredPlanSubscription(workspaceId))) {
      throw new BillingException(
        'Workspace subscription plan is required',
        BillingExceptionCode.BILLING_PLAN_REQUIRED,
      );
    }
  }
}
