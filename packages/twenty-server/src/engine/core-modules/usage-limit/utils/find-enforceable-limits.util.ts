import { type UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { isIntraWorkspaceLimitEntitled } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-limit-entitled.util';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

export const findEnforceableLimits = async ({
  workspaceId,
  limits,
  entitlementProvider,
}: {
  workspaceId: string;
  limits: FlatUsageLimit[];
  entitlementProvider: UsageLimitEntitlementProvider | null;
}): Promise<FlatUsageLimit[]> => {
  if (!limits.some((limit) => isIntraWorkspaceScoped(limit.spenderType))) {
    return limits;
  }

  try {
    if (
      await isIntraWorkspaceLimitEntitled({ workspaceId, entitlementProvider })
    ) {
      return limits;
    }
  } catch {
    return limits;
  }

  return limits.filter((limit) => !isIntraWorkspaceScoped(limit.spenderType));
};
