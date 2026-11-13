import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { buildTeamsConnectedAccountTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connected-account-tenant-kv-key';
import { fetchTeamsTenantId } from 'src/features/chat/logic-functions/utils/fetch-teams-tenant-id';
import { TEAMS_GRAPH_DIRECTORY_SCOPE } from 'src/features/transcripts/constants/teams-oauth-config';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';
import { getConnectionAccessTokenOrThrow } from 'src/utils/get-connection-access-token-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';

type TeamsWorkspaceGraphAccess =
  | { success: true; accessToken: string; tenantId: string }
  | { success: false; error: string };

const NOT_CONNECTED_ERROR_MESSAGE =
  'Microsoft Teams is not connected for this workspace. Open the Microsoft Teams app settings and reconnect.';

const MISSING_DIRECTORY_SCOPE_ERROR_MESSAGE =
  'The Microsoft Teams connection cannot read the organization directory. Reconnect Microsoft Teams from the app settings to grant directory access, or remove the outdated connection.';

export const getTeamsWorkspaceGraphAccess =
  async (): Promise<TeamsWorkspaceGraphAccess> => {
    try {
      const connections = await listTeamsConnections();
      const workspaceConnections = connections.filter(
        (candidate) =>
          candidate.scope === 'WORKSPACE' &&
          !isDefined(candidate.authFailedAt),
      );

      if (!isNonEmptyArray(workspaceConnections)) {
        return { success: false, error: NOT_CONNECTED_ERROR_MESSAGE };
      }

      const connection = workspaceConnections.find((candidate) =>
        candidate.scopes.includes(TEAMS_GRAPH_DIRECTORY_SCOPE),
      );

      if (!isDefined(connection)) {
        return { success: false, error: MISSING_DIRECTORY_SCOPE_ERROR_MESSAGE };
      }

      const accessToken = getConnectionAccessTokenOrThrow(connection);
      const storedTenantId = await kv.get<string>(
        buildTeamsConnectedAccountTenantKvKey(connection.id),
      );
      const tenantId = isNonEmptyString(storedTenantId)
        ? storedTenantId
        : await fetchTeamsTenantId(accessToken);

      return { success: true, accessToken, tenantId };
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    }
  };
