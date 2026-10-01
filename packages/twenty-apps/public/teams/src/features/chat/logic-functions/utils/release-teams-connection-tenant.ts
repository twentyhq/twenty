import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';

const listTeamsConnectionIds = async (): Promise<string[]> =>
  (await listConnections({ providerName: TEAMS_PROVIDER_NAME })).map(
    (connection) => connection.id,
  );

const isTenantHeldByConnections = async ({
  tenantId,
  connectionIds,
}: {
  tenantId: string;
  connectionIds: string[];
}): Promise<boolean> => {
  const claimedTenantIds = await Promise.all(
    connectionIds.map((connectionId) =>
      kv.get<string>(buildTeamsConnectedAccountTenantKvKey(connectionId)),
    ),
  );

  return claimedTenantIds.includes(tenantId);
};

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

  if (!isNonEmptyString(tenantId)) {
    return { releasedTenantId: null };
  }

  const connectionIds = await listTeamsConnectionIds();

  await kv.delete(connectedAccountTenantKvKey);

  const isTenantHeldElsewhere = await isTenantHeldByConnections({
    tenantId,
    connectionIds,
  }).catch(async (error: unknown) => {
    await kv.set(connectedAccountTenantKvKey, tenantId);
    throw error;
  });

  if (isTenantHeldElsewhere) {
    return { releasedTenantId: null };
  }

  const tenantKvKey = buildTeamsTenantKvKey(tenantId);
  const hasReleasedTenant = await kv.delete(tenantKvKey, { scope: 'SERVER' });

  if (
    await isTenantHeldByConnections({
      tenantId,
      connectionIds: await listTeamsConnectionIds(),
    })
  ) {
    await kv.set(tenantKvKey, null, { scope: 'SERVER' });

    return { releasedTenantId: null };
  }

  return { releasedTenantId: hasReleasedTenant ? tenantId : null };
};
