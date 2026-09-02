/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('currentBillingSubscription', { packingPonderation: 1 })
export class WorkspaceCurrentBillingSubscriptionCacheService extends WorkspaceCacheProvider<CurrentBillingSubscription> {
  private readonly logger = new Logger(
    WorkspaceCurrentBillingSubscriptionCacheService.name,
  );

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingUsageService: BillingUsageService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: WorkspaceCacheProviderContext): Promise<CurrentBillingSubscription> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscription({
        workspaceId: workspaceId,
      });

    if (!isDefined(subscription)) {
      return NO_BILLING_SUBSCRIPTION;
    }

    return {
      id: subscription.id,
      workspaceId: subscription.workspaceId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      interval: subscription.interval,
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelAt: subscription.cancelAt,
      canceledAt: subscription.canceledAt,
      endedAt: subscription.endedAt,
      trialStart: subscription.trialStart,
      trialEnd: subscription.trialEnd,
      collectionMethod: subscription.collectionMethod,
      allowanceMicro: await this.computeAllowanceMicro(subscription),
    };
  }

  // Broken price metadata must degrade to "no allowance" rather than fail the
  // whole cache key and take unrelated consumers down with it.
  private async computeAllowanceMicro(
    subscription: BillingSubscriptionEntity,
  ): Promise<number | null> {
    try {
      const creditBalanceMicro =
        await this.billingCreditGrantService.getActiveCreditsMicro(
          subscription.workspaceId,
        );

      return (
        this.billingUsageService.getResourceUsageCap(subscription) +
        creditBalanceMicro
      );
    } catch (error) {
      this.logger.warn(
        `Could not compute allowance for workspace ${subscription.workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return null;
    }
  }
}
