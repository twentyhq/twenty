import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';

// The server refuses a claim another workspace holds; reading the key back
// tells that refusal apart from a transient failure without parsing the message.
export const claimTeamsTenant = async (
  tenantId: string,
): Promise<{ isClaimed: boolean }> => {
  const tenantKvKey = buildTeamsTenantKvKey(tenantId);

  try {
    await kv.set(tenantKvKey, null, { scope: 'SERVER' });

    return { isClaimed: true };
  } catch (error) {
    const claimingWorkspaceId = await kv.get<string>(tenantKvKey, {
      scope: 'SERVER',
    });

    if (isNonEmptyString(claimingWorkspaceId)) {
      return { isClaimed: false };
    }

    throw error;
  }
};
