/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';

@Injectable()
export class BillingUsageLimitEntitlementProvider extends UsageLimitEntitlementProvider {
  private readonly logger = new Logger(
    BillingUsageLimitEntitlementProvider.name,
  );

  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  async hasIntraWorkspaceLimitEntitlement(
    workspaceId: string,
  ): Promise<boolean> {
    try {
      return await this.billingSubscriptionService.getWorkspaceEntitlementValue(
        workspaceId,
        BillingEntitlementKey.USAGE_LIMIT,
      );
    } catch (error) {
      this.logger.warn(
        `Could not read usage-limit entitlement for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      throw error;
    }
  }
}
