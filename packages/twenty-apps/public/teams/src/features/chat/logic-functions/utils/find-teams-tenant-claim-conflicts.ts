import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTenantClaimConflict } from 'src/features/chat/logic-functions/types/teams-tenant-claim-conflict.type';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';

export const findTeamsTenantClaimConflicts = async ({
  connectedAccountIds,
}: {
  connectedAccountIds: string[];
}): Promise<TeamsTenantClaimConflict[]> =>
  (
    await Promise.all(
      connectedAccountIds.map((connectedAccountId) =>
        kv.get<TeamsTenantClaimConflict>(
          buildTeamsTenantClaimConflictKvKey(connectedAccountId),
        ),
      ),
    )
  ).filter(isDefined);
