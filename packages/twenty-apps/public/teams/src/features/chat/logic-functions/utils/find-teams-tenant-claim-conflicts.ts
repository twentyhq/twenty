import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTenantClaimConflict } from 'src/features/chat/logic-functions/types/teams-tenant-claim-conflict.type';
import { buildTeamsTenantClaimConflictKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-claim-conflict-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { fetchCurrentWorkspaceId } from 'src/features/chat/logic-functions/utils/fetch-current-workspace-id';

const isHeldByAnotherWorkspace = async ({
  tenantId,
  currentWorkspaceId,
}: {
  tenantId: string;
  currentWorkspaceId: string;
}): Promise<boolean> => {
  const claimingWorkspaceId = await kv.get<string>(
    buildTeamsTenantKvKey(tenantId),
    { scope: 'SERVER' },
  );

  return (
    isNonEmptyString(claimingWorkspaceId) &&
    claimingWorkspaceId !== currentWorkspaceId
  );
};

// A record outlives its conflict once another connection reclaims the tenant.
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

  const currentWorkspaceId = await fetchCurrentWorkspaceId();
  const liveConflicts = await Promise.all(
    recordedConflicts.map(async (conflict) =>
      (await isHeldByAnotherWorkspace({
        tenantId: conflict.tenantId,
        currentWorkspaceId,
      }))
        ? conflict
        : undefined,
    ),
  );

  return liveConflicts.filter(isDefined);
};
