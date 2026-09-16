/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { RecordSharingEntitlementProvider } from 'src/engine/core-modules/record-share/interfaces/record-sharing-entitlement-provider.service';

@Injectable()
export class BillingRecordSharingEntitlementProvider extends RecordSharingEntitlementProvider {
  constructor(
    private readonly billingSubscriptionService: BillingSubscriptionService,
  ) {
    super();
  }

  async hasRecordSharingEntitlement(workspaceId: string): Promise<boolean> {
    return this.billingSubscriptionService.getWorkspaceEntitlementValue(
      workspaceId,
      BillingEntitlementKey.RECORD_SHARING,
    );
  }
}
