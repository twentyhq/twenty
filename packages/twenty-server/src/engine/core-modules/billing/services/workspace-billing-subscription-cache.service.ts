/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';

import { type FlatBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

@Injectable()
@WorkspaceCache('billingSubscription')
export class WorkspaceBillingSubscriptionCacheService extends WorkspaceCacheProvider<FlatBillingSubscription> {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatBillingSubscription> {
    const subscription =
      await this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
        {
          workspaceId,
        },
      );

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
    };
  }
}
