import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';
import { getConnectionAccessTokenOrThrow } from 'src/utils/get-connection-access-token-or-throw';

type TeamsWorkspaceGraphAccess =
  | { success: true; accessToken: string; tenantId: string }
  | { success: false; error: string };

// A settings route has no connect event, so the workspace-shared Teams
// connection is resolved the way Slack resolves its installed workspace client:
// the WORKSPACE-scoped connected account carries the delegated Graph token, and
// its tenant is the claim already stored at install time.
export const getTeamsWorkspaceGraphAccess =
  async (): Promise<TeamsWorkspaceGraphAccess> => {
    const connections = await listTeamsConnections();
    const connection = connections.find(
      (candidate) =>
        candidate.visibility === 'workspace' &&
        !isDefined(candidate.authFailedAt),
    );

    if (!isDefined(connection)) {
      return {
        success: false,
        error:
          'Microsoft Teams is not connected for this workspace. Open the Microsoft Teams app settings and reconnect.',
      };
    }

    const accessToken = getConnectionAccessTokenOrThrow(connection);

    const storedTenantId = await kv
      .get<string>(buildTeamsConnectedAccountTenantKvKey(connection.id))
      .catch(() => null);

    const tenantId = isNonEmptyString(storedTenantId)
      ? storedTenantId
      : await fetchTeamsTenantId(accessToken);

    return { success: true, accessToken, tenantId };
  };
