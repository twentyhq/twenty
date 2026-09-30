import { kv, listConnections } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';

export const isTeamsTenantClaimedByAnotherConnection = async (
  tenantId: string,
): Promise<boolean> => {
  const connections = await listConnections({
    providerName: TEAMS_PROVIDER_NAME,
  });

  const claimedTenantIds = await Promise.all(
    connections.map((connection) =>
      kv.get<string>(buildTeamsConnectedAccountTenantKvKey(connection.id)),
    ),
  );

  return claimedTenantIds.includes(tenantId);
};
