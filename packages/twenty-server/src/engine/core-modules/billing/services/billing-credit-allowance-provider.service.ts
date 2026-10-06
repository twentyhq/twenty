/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class BillingCreditAllowanceProvider extends CreditAllowanceProvider {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  async isCreditAllowanceEnabled(): Promise<boolean> {
    return this.twentyConfigService.get('IS_BILLING_ENABLED');
  }

  async getCreditAllowancePeriod(
    workspaceId: string,
  ): Promise<UsagePeriod | null> {
    const subscription = await this.findCurrentBillingSubscription(workspaceId);

    if (!isDefined(subscription)) {
      return null;
    }

    return {
      periodStart: new Date(subscription.currentPeriodStart),
      periodEnd: new Date(subscription.currentPeriodEnd),
    };
  }

  async getCreditAllowance(
    workspaceId: string,
  ): Promise<CreditAllowance | null> {
    const subscription = await this.findCurrentBillingSubscription(workspaceId);

    if (
      !isDefined(subscription) ||
      !isDefined(subscription.creditAllowanceSchedule)
    ) {
      return null;
    }

    return {
      periodStart: new Date(subscription.currentPeriodStart),
      periodEnd: new Date(subscription.currentPeriodEnd),
      schedule: subscription.creditAllowanceSchedule,
    };
  }

  private async findCurrentBillingSubscription(
    workspaceId: string,
  ): Promise<FlatBillingSubscription | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    return currentBillingSubscription === NO_BILLING_SUBSCRIPTION
      ? null
      : currentBillingSubscription;
  }
}
