import { kv } from 'twenty-sdk/logic-function';

import { type TeamsTenantClaimConflict } from 'src/features/chat/logic-functions/types/teams-tenant-claim-conflict.type';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';

export const saveTeamsTenantClaimConflict = async ({
  connectedAccountId,
  tenantId,
}: {
  connectedAccountId: string;
  tenantId: string;
}): Promise<void> => {
  await kv.set<TeamsTenantClaimConflict>(
    buildTeamsTenantClaimConflictKvKey(connectedAccountId),
    { tenantId, failedAt: new Date().toISOString() },
  );
};
