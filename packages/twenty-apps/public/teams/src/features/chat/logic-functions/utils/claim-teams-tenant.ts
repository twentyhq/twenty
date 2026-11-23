import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { isTeamsTenantHeldByAnotherWorkspace } from 'src/features/chat/logic-functions/utils/is-teams-tenant-held-by-another-workspace';

export const claimTeamsTenant = async ({
  tenantId,
  workspaceId,
}: {
  tenantId: string;
  workspaceId: string;
}): Promise<boolean> => {
  try {
    await kv.set(buildTeamsTenantKvKey(tenantId), null, { scope: 'SERVER' });

    return true;
  } catch (error) {
    if (await isTeamsTenantHeldByAnotherWorkspace({ tenantId, workspaceId })) {
      return false;
    }

    throw error;
  }
};
