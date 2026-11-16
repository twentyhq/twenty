import { isNonEmptyString } from '@sniptt/guards';
import { type AppConnection, getConnection, kv } from 'twenty-sdk/logic-function';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { matchTeamsDirectoryByEmail } from 'src/features/chat/logic-functions/utils/match-teams-directory-by-email';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';
import { TEAMS_GRAPH_DIRECTORY_SCOPE } from 'src/features/transcripts/constants/teams-oauth-config';
import { getConnectionAccessTokenOrThrow } from 'src/utils/get-connection-access-token-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';

const matchTeamsDirectoryOnConnect = async ({
  connection,
  accessToken,
  tenantId,
}: {
  connection: AppConnection;
  accessToken: string;
  tenantId: string;
}): Promise<void> => {
  if (!connection.scopes.includes(TEAMS_GRAPH_DIRECTORY_SCOPE)) {
    console.warn(
      '[teams] directory email match skipped: the connection cannot read the organization directory',
    );

    return;
  }

  try {
    await matchTeamsDirectoryByEmail({ accessToken, teamsTenantId: tenantId });
  } catch (error) {
    console.warn(
      `[teams] directory email match skipped: ${toErrorMessage(error)}`,
    );
  }
};

export const registerTeamsConnection = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ claimedTenantId: string | null }> => {
  const isChatEnabled = isTeamsChatEnabled();
  const connection = isChatEnabled
    ? await getConnection(connectedAccountId)
    : undefined;

  if (connection?.scope !== 'WORKSPACE') {
    await releaseTeamsConnectionTenant({ connectedAccountId });

    return { claimedTenantId: null };
  }

  const accessToken = getConnectionAccessTokenOrThrow(connection);
  const tenantId = await fetchTeamsTenantId(accessToken);
  const connectedAccountTenantKvKey =
    buildTeamsConnectedAccountTenantKvKey(connectedAccountId);
  const previousTenantId = await kv.get<string>(connectedAccountTenantKvKey);

  if (isNonEmptyString(previousTenantId) && previousTenantId !== tenantId) {
    await releaseTeamsConnectionTenant({ connectedAccountId });
  }

  await kv.set(connectedAccountTenantKvKey, tenantId);
  await kv.set(buildTeamsTenantKvKey(tenantId), null, { scope: 'SERVER' });

  await matchTeamsDirectoryOnConnect({ connection, accessToken, tenantId });

  return { claimedTenantId: tenantId };
};
