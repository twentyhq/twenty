import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';
import { TEAMS_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { deleteTeamsTranscriptHistoryKvKeys } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-history-kv-keys';
import { unregisterTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/unregister-teams-transcript-subscription';

export const teamsUninstallHandler = async (): Promise<{
  failedConnectionCount: number;
}> => {
  const connections = await listConnections({
    providerName: TEAMS_PROVIDER_NAME,
  });
  const results = await Promise.allSettled(
    connections.map((connection) =>
      Promise.all([
        unregisterTeamsTranscriptSubscription({
          connectedAccountId: connection.id,
        }),
        deleteTeamsTranscriptHistoryKvKeys({
          connectedAccountId: connection.id,
        }),
      ]),
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
    'Deletes the Microsoft Graph transcript subscription and the transcript history import state of every Teams connection when the app is uninstalled.',
  timeoutSeconds: 60,
  handler: teamsUninstallHandler,
});
