import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
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
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
  ) {}

  isBillingEnabled() {
    return this.environmentService.get('IS_BILLING_ENABLED');
  }

  async hasWorkspaceSubscriptionOrFreeAccess(workspaceId: string) {
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

    const subscription = await this.billingSubscriptionRepository.findOne({
      where: { workspaceId },
    });

    return isDefined(subscription);
  }

  async hasFreeAccessOrEntitlement(
    workspaceId: string,
    entitlementKey: BillingEntitlementKey,
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

    return this.billingSubscriptionService.getWorkspaceEntitlementByKey(
      workspaceId,
      entitlementKey,
    );
  }
}
