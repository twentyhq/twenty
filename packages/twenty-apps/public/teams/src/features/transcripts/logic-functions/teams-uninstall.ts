import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { TEAMS_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';
import { unregisterTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/unregister-teams-transcript-subscription';

export const teamsUninstallHandler = async (): Promise<{
  failedConnectionCount: number;
}> => {
  const connections = await listTeamsConnections();
  const results = await Promise.allSettled(
    connections.map((connection) =>
      unregisterTeamsTranscriptSubscription({
        connectedAccountId: connection.id,
      }),
    ),
  );

  return {
    failedConnectionCount: results.filter(
      (result) => result.status === 'rejected',
    ).length,
  };
};

export default defineUninstallLogicFunction({
  universalIdentifier: TEAMS_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'teams-uninstall',
  description:
    'Deletes the Microsoft Graph transcript subscription of every Teams connection when the app is uninstalled.',
  timeoutSeconds: 60,
  handler: teamsUninstallHandler,
});
