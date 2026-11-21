import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsChatConnectionReconciliation } from 'src/features/chat/logic-functions/types/teams-chat-reconciliation.type';
import { isWorkingTeamsWorkspaceConnection } from 'src/features/chat/logic-functions/utils/is-working-teams-workspace-connection';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';
import { toErrorMessage } from 'src/utils/to-error-message';

const reconcileTeamsConnectionTenantClaim = async ({
  connectedAccountId,
  isChatEnabled,
  workspaceId,
}: {
  connectedAccountId: string;
  isChatEnabled: boolean;
  workspaceId: string;
}): Promise<TeamsChatConnectionReconciliation> => {
  try {
    const { claimedTenantId, conflictingTenantId } =
      await registerTeamsConnection({
        connectedAccountId,
        workspaceId,
        isChatEnabled,
        shouldMatchDirectory: false,
      });

    if (isNonEmptyString(conflictingTenantId)) {
      return {
        connectedAccountId,
        status: 'CONFLICT',
        tenantId: conflictingTenantId,
      };
    }

    if (!isNonEmptyString(claimedTenantId)) {
      return { connectedAccountId, status: 'RELEASED' };
    }

    return { connectedAccountId, status: 'CLAIMED', tenantId: claimedTenantId };
  } catch (error) {
    return {
      connectedAccountId,
      status: 'FAILED',
      error: toErrorMessage(error),
    };
  }
};

export const reconcileTeamsChatTenantClaims = async ({
  isChatEnabled,
  workspaceId,
}: {
  isChatEnabled: boolean;
  workspaceId: string;
}): Promise<TeamsChatConnectionReconciliation[]> => {
  const connections = await listTeamsConnections();
  const connectionsToReconcile = isChatEnabled
    ? connections.filter(isWorkingTeamsWorkspaceConnection)
    : connections;
  const reconciliations: TeamsChatConnectionReconciliation[] = [];

  for (const connection of connectionsToReconcile) {
    reconciliations.push(
      await reconcileTeamsConnectionTenantClaim({
        connectedAccountId: connection.id,
        isChatEnabled,
        workspaceId,
      }),
    );
  }

  return reconciliations;
};
