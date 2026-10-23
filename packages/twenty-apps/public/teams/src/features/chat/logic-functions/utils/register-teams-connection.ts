import { isNonEmptyString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';

export const registerTeamsConnection = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ claimedTenantId: string | null }> => {
  const isChatEnabled = isTeamsChatEnabled();
  const connection = isChatEnabled
    ? await getConnection(connectedAccountId)
    : undefined;

  if (connection?.visibility !== 'workspace') {
    await releaseTeamsConnectionTenant({ connectedAccountId });

    return { claimedTenantId: null };
  }

  const tenantId = await fetchTeamsTenantId(connection.accessToken);
  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const previousTenantId = await kv.get<string>(connectedAccountTenantKvKey);

  if (isNonEmptyString(previousTenantId) && previousTenantId !== tenantId) {
    await releaseTeamsConnectionTenant({ connectedAccountId });
  }

  await kv.set(connectedAccountTenantKvKey, tenantId);
  await kv.set(buildTeamsTenantKvKey(tenantId), null, { scope: 'SERVER' });

  return { claimedTenantId: tenantId };
};
