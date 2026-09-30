import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';

export const releaseTeamsConnectionTenant = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ releasedTenantId: string | null }> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error('Teams tenant release failed: missing connectedAccountId');
  }

  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const tenantId = await kv.get<string>(connectedAccountTenantKvKey);
  const connections = isNonEmptyString(tenantId)
    ? await listConnections({ providerName: TEAMS_PROVIDER_NAME })
    : [];

  await kv.delete(connectedAccountTenantKvKey);

  if (!isNonEmptyString(tenantId)) {
    return { releasedTenantId: null };
  }

  const claimedTenantIds = await Promise.all(
    connections.map((connection) =>
      kv.get<string>(buildTeamsConnectedAccountTenantKvKey(connection.id)),
    ),
  );

  if (claimedTenantIds.includes(tenantId)) {
    return { releasedTenantId: null };
  }

  const hasReleasedTenant = await kv.delete(buildTeamsTenantKvKey(tenantId), {
    scope: 'SERVER',
  });

  return { releasedTenantId: hasReleasedTenant ? tenantId : null };
};
