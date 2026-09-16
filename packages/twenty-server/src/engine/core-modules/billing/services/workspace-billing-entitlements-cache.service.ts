/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const BILLING_ENTITLEMENTS_ROWS_REQUIREMENT = {
  billingEntitlement: ['key', 'value'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('billingEntitlements', { packingPonderation: 1 })
export class WorkspaceBillingEntitlementsCacheService extends WorkspaceCacheProvider<BillingEntitlements> {
  override readonly rowsRequirement: WorkspaceCacheRowsRequirement;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    super();

    this.rowsRequirement = this.twentyConfigService.get('IS_BILLING_ENABLED')
      ? BILLING_ENTITLEMENTS_ROWS_REQUIREMENT
      : {};
  }

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof BILLING_ENTITLEMENTS_ROWS_REQUIREMENT
  >): BillingEntitlements {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return {};
    }

    return rows.billingEntitlement.reduce<BillingEntitlements>(
      (entitlementsByKey, { key, value }) => {
        entitlementsByKey[key] = value;

        return entitlementsByKey;
      },
      {},
    );
  }
}
