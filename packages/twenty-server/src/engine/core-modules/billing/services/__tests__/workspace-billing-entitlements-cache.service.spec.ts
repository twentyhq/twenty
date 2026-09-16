/* @license Enterprise */

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { WorkspaceBillingEntitlementsCacheService } from 'src/engine/core-modules/billing/services/workspace-billing-entitlements-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('WorkspaceBillingEntitlementsCacheService', () => {
  const service = new WorkspaceBillingEntitlementsCacheService();

  it('preserves both granted and revoked entitlements', () => {
    expect(
      service.computeForCache({
        workspaceId: WORKSPACE_ID,
        rows: {
          billingEntitlement: [
            { key: BillingEntitlementKey.USAGE_LIMIT, value: true },
            { key: BillingEntitlementKey.RLS, value: false },
          ],
        },
      }),
    ).toEqual({
      [BillingEntitlementKey.USAGE_LIMIT]: true,
      [BillingEntitlementKey.RLS]: false,
    });
  });

  it('returns an empty map for a workspace without entitlement rows', () => {
    expect(
      service.computeForCache({
        workspaceId: WORKSPACE_ID,
        rows: { billingEntitlement: [] },
      }),
    ).toEqual({});
  });
});
