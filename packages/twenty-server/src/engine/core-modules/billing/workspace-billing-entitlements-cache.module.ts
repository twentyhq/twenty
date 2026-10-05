/* @license Enterprise */

import { Module } from '@nestjs/common';

import { WorkspaceBillingEntitlementsCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-entitlements-cache.service';

@Module({
  providers: [WorkspaceBillingEntitlementsCacheService],
})
export class WorkspaceBillingEntitlementsCacheModule {}
