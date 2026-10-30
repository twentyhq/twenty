/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingCreditGrantService } from 'src/engine/core-modules/billing/services/billing-credit-grant.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';

import { NO_BILLING_SUBSCRIPTION } from 'src/engine/core-modules/billing/constants/no-billing-subscription.constant';
import { UserCreditsFallback } from 'src/engine/core-modules/billing/enums/billing-user-credits-fallback.enum';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { isBaseProductSubscriptionItem } from 'src/engine/core-modules/billing/utils/is-base-product-subscription-item.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';

@Injectable()
@WorkspaceCache('currentBillingSubscription', { packingPonderation: 1 })
export class WorkspaceCurrentBillingSubscriptionCacheService extends WorkspaceCacheProvider<CurrentBillingSubscription> {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingCreditGrantService: BillingCreditGrantService,
    private readonly billingUsageService: BillingUsageService,
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

    const [unexpiredGrants, billingCustomer] = await Promise.all([
      this.billingCreditGrantService.findUnexpiredGrants(workspaceId),
      this.billingSubscriptionService.getBillingCustomer(workspaceId),
    ]);

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
      planAllowanceMicro:
        this.billingUsageService.findResourceUsageCap(subscription),
      planKey:
        subscription.billingSubscriptionItems.find(
          isBaseProductSubscriptionItem,
        )?.billingProduct?.metadata.planKey ?? null,
      userCreditsFallback:
        billingCustomer?.userCreditsFallback ??
        UserCreditsFallback.WORKSPACE_CREDITS,
      creditGrants: unexpiredGrants.map(
        ({ amountMicro, effectiveAt, expiresAt }) => ({
          amountMicro,
          effectiveAtMs: effectiveAt.getTime(),
          expiresAtMs: expiresAt?.getTime() ?? null,
        }),
      ),
    };
  }
}
