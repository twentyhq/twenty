import { isDefined } from 'twenty-shared/utils';

import { type UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';

export const isIntraWorkspaceLimitEntitled = async ({
  workspaceId,
  entitlementProvider,
}: {
  workspaceId: string;
  entitlementProvider: UsageLimitEntitlementProvider | null;
}): Promise<boolean> =>
  isDefined(entitlementProvider)
    ? entitlementProvider.hasIntraWorkspaceLimitEntitlement(workspaceId)
    : true;
