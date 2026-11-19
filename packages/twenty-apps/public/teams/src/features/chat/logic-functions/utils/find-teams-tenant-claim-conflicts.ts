import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTenantClaimConflict } from 'src/features/chat/logic-functions/types/teams-tenant-claim-conflict.type';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';
import { fetchCurrentWorkspaceIdOrThrow } from 'src/features/chat/logic-functions/utils/fetch-current-workspace-id-or-throw';
import { isTeamsTenantHeldByAnotherWorkspace } from 'src/features/chat/logic-functions/utils/is-teams-tenant-held-by-another-workspace';

export const findTeamsTenantClaimConflicts = async ({
  connectedAccountIds,
}: {
  connectedAccountIds: string[];
}): Promise<TeamsTenantClaimConflict[]> => {
  const recordedConflicts = (
    await Promise.all(
      connectedAccountIds.map((connectedAccountId) =>
        kv.get<TeamsTenantClaimConflict>(
          buildTeamsTenantClaimConflictKvKey(connectedAccountId),
        ),
      ),
    )
  ).filter(isDefined);

  if (recordedConflicts.length === 0) {
    return [];
  }

  const workspaceId = await fetchCurrentWorkspaceIdOrThrow();
  const liveConflicts = await Promise.all(
    recordedConflicts.map(async (conflict) =>
      (await isTeamsTenantHeldByAnotherWorkspace({
        tenantId: conflict.tenantId,
        workspaceId,
      }))
        ? conflict
        : undefined,
    ),
  );

  return liveConflicts.filter(isDefined);
};
