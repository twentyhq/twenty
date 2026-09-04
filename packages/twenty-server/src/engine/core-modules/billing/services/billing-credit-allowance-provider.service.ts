/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { type CreditAllowance } from 'src/engine/core-modules/usage-limit/types/credit-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class BillingCreditAllowanceProvider extends CreditAllowanceProvider {
  private readonly logger = new Logger(BillingCreditAllowanceProvider.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingUsageService: BillingUsageService,
  ) {
    super();
  }

  async isCreditAllowanceEnabled(workspaceId: string): Promise<boolean> {
    return this.billingUsageService.isAllowanceCounterEnabled(workspaceId);
  }

  async getCreditAllowancePeriod(
    workspaceId: string,
  ): Promise<UsagePeriod | null> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return null;
    }

    const { currentBillingSubscription } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'currentBillingSubscription',
      ]);

    if (currentBillingSubscription === NO_BILLING_SUBSCRIPTION) {
      return null;
    }

    return {
      periodStart: new Date(currentBillingSubscription.currentPeriodStart),
      periodEnd: new Date(currentBillingSubscription.currentPeriodEnd),
    };
  }

  async getCreditAllowance(
    workspaceId: string,
  ): Promise<CreditAllowance | null> {
    const period = await this.getCreditAllowancePeriod(workspaceId);

    if (!isDefined(period)) {
      return null;
    }

    try {
      const subscription =
        await this.billingSubscriptionService.getCurrentBillingSubscription({
          workspaceId,
        });

      if (!isDefined(subscription)) {
        return null;
      }

      const creditBalanceMicro =
        await this.billingCreditGrantService.getActiveCreditsMicro(workspaceId);

      return {
        ...period,
        allowanceMicro:
          this.billingUsageService.getResourceUsageCap(subscription) +
          creditBalanceMicro,
      };
    } catch (error) {
      this.logger.warn(
        `Could not compute allowance for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }
}
