import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { fetchCurrentWorkspaceIdOrThrow } from 'src/features/chat/logic-functions/utils/fetch-current-workspace-id-or-throw';

export const claimTeamsTenant = async (
  tenantId: string,
): Promise<{ isClaimed: boolean }> => {
  const tenantKvKey = buildTeamsTenantKvKey(tenantId);

  try {
    await kv.set(tenantKvKey, null, { scope: 'SERVER' });

    return { isClaimed: true };
  } catch (error) {
    // Reading the claim back tells a refusal apart from a transient failure.
    const claimingWorkspaceId = await kv.get<string>(tenantKvKey, {
      scope: 'SERVER',
    });

    if (
      isNonEmptyString(claimingWorkspaceId) &&
      claimingWorkspaceId !== (await fetchCurrentWorkspaceIdOrThrow())
    ) {
      return { isClaimed: false };
    }

    throw error;
  }
};
