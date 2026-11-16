import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { claimTeamsTenant } from 'src/features/chat/logic-functions/utils/claim-teams-tenant';
import { deleteTeamsTenantClaimConflict } from 'src/features/chat/logic-functions/utils/delete-teams-tenant-claim-conflict';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';
import { saveTeamsTenantClaimConflict } from 'src/features/chat/logic-functions/utils/save-teams-tenant-claim-conflict';
import { getConnectionAccessTokenOrThrow } from 'src/utils/get-connection-access-token-or-throw';

export type RegisterTeamsConnectionResult = {
  claimedTenantId: string | null;
  conflictingTenantId?: string;
};

export const registerTeamsConnection = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<RegisterTeamsConnectionResult> => {
  const isChatEnabled = isTeamsChatEnabled();
  const connection = isChatEnabled
    ? await getConnection(connectedAccountId)
    : undefined;

  if (connection?.scope !== 'WORKSPACE') {
    await releaseTeamsConnectionTenant({ connectedAccountId });
    await deleteTeamsTenantClaimConflict({ connectedAccountId });

    return { claimedTenantId: null };
  }

  const tenantId = await fetchTeamsTenantId(
    getConnectionAccessTokenOrThrow(connection),
  );
  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const previousTenantId = await kv.get<string>(connectedAccountTenantKvKey);

  if (isNonEmptyString(previousTenantId) && previousTenantId !== tenantId) {
    await releaseTeamsConnectionTenant({ connectedAccountId });
  }

  const { isClaimed } = await claimTeamsTenant(tenantId);

  // The hook runs queued and its errors are swallowed, so a lost claim is
  // recorded for the health check instead of thrown into a doomed retry.
  if (!isClaimed) {
    await kv.delete(connectedAccountTenantKvKey);
    await saveTeamsTenantClaimConflict({ connectedAccountId, tenantId });

    return { claimedTenantId: null, conflictingTenantId: tenantId };
  }

  await kv.set(connectedAccountTenantKvKey, tenantId);
  await deleteTeamsTenantClaimConflict({ connectedAccountId });

  return { claimedTenantId: tenantId };
};
