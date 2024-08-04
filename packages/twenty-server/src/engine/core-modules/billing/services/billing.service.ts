import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { SubscriptionStatus } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { IsFeatureEnabledService } from 'src/engine/core-modules/feature-flag/services/is-feature-enabled.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class BillingService {
  protected readonly logger = new Logger(BillingService.name);
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly isFeatureEnabledService: IsFeatureEnabledService,
  ) {}

  isBillingEnabled() {
    return this.environmentService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceActiveSubscriptionOrFreeAccess(workspaceId: string) {
    const isBillingEnabled = this.environmentService.get('IS_BILLING_ENABLED');

    if (!isBillingEnabled) {
      return false;
    }

    const isFreeAccessEnabled =
      await this.isFeatureEnabledService.isFeatureEnabled(
        FeatureFlagKey.IsFreeAccessEnabled,
        workspaceId,
      );

    if (isFreeAccessEnabled) {
      return false;
    }

    const currentBillingSubscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        { workspaceId },
      );

    return (
      !isDefined(currentBillingSubscription) ||
      currentBillingSubscription?.status === SubscriptionStatus.Incomplete
    );
  }
}
