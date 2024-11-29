import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly isFeatureEnabledService: FeatureFlagService,
  ) {}

  isBillingEnabled() {
    return this.environmentService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceActiveSubscriptionOrFreeAccessOrEntitlement(
    workspaceId: string,
    entitlementKey?: BillingEntitlementKey,
  ) {
    const isBillingEnabled = this.isBillingEnabled();

    if (!isBillingEnabled) {
      return true;
    }

    const isFreeAccessEnabled =
      await this.isFeatureEnabledService.isFeatureEnabled(
        FeatureFlagKey.IsFreeAccessEnabled,
        workspaceId,
      );

    if (isFreeAccessEnabled) {
      return true;
    }

    if (entitlementKey) {
      return this.billingSubscriptionService.getWorkspaceEntitlementByKey(
        workspaceId,
        entitlementKey,
      );
    }

    const currentBillingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    return (
      isDefined(currentBillingSubscription) &&
      [
        SubscriptionStatus.Active,
        SubscriptionStatus.Trialing,
        SubscriptionStatus.PastDue,
      ].includes(currentBillingSubscription.status)
    );
  }
}
