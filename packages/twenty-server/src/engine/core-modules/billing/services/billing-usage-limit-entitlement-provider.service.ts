/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';

@Injectable()
export class BillingUsageLimitEntitlementProvider extends UsageLimitEntitlementProvider {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  async hasIntraWorkspaceLimitEntitlement(
    workspaceId: string,
  ): Promise<boolean> {
    return this.billingSubscriptionService.getWorkspaceEntitlementValue(
      workspaceId,
      BillingEntitlementKey.USAGE_LIMIT,
    );
  }
}
