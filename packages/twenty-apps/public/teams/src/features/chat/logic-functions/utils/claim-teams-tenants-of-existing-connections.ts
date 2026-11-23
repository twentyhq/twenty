import { isNonEmptyString } from '@sniptt/guards';

import { fetchCurrentWorkspaceIdOrThrow } from 'src/features/chat/logic-functions/utils/fetch-current-workspace-id-or-throw';
import { isWorkingTeamsWorkspaceConnection } from 'src/features/chat/logic-functions/utils/is-working-teams-workspace-connection';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';
import { toErrorMessage } from 'src/utils/to-error-message';

type ClaimTeamsTenantsResult = {
  claimedConnectionCount: number;
  conflictingConnectionCount: number;
  failedConnectionCount: number;
};

export const claimTeamsTenantsOfExistingConnections =
  async (): Promise<ClaimTeamsTenantsResult> => {
    const connections = (await listTeamsConnections()).filter(
      isWorkingTeamsWorkspaceConnection,
    );
    const result: ClaimTeamsTenantsResult = {
      claimedConnectionCount: 0,
      conflictingConnectionCount: 0,
      failedConnectionCount: 0,
    };

    if (connections.length === 0) {
      return result;
    }

    const workspaceId = await fetchCurrentWorkspaceIdOrThrow();

    // Sequential: claims of connections sharing a tenant race when run together.
    for (const connection of connections) {
      try {
        const { claimedTenantId, conflictingTenantId } =
          await registerTeamsConnection({
            connectedAccountId: connection.id,
            workspaceId,
            shouldMatchDirectory: false,
          });

        if (isNonEmptyString(claimedTenantId)) {
          result.claimedConnectionCount += 1;
        }

        if (isNonEmptyString(conflictingTenantId)) {
          result.conflictingConnectionCount += 1;
        }
      } catch (error) {
        result.failedConnectionCount += 1;
        console.warn(
          `[teams] could not claim the tenant of connection ${connection.id}: ${toErrorMessage(error)}`,
        );
      }
    }

    return result;
  };
