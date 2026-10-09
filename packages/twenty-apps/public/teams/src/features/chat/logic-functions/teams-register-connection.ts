import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';
import { registerTeamsTranscriptSubscription } from 'src/features/transcripts/logic-functions/utils/register-teams-transcript-subscription';
import { startTeamsTranscriptHistoryInitialImportOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-initial-import-or-throw';

export const teamsRegisterConnectionHandler = async (payload: {
  connectedAccountId: string;
}) => {
  const [
    chatRegistration,
    transcriptRegistration,
    transcriptHistoryInitialImport,
  ] = await Promise.allSettled([
    registerTeamsConnection(payload),
    registerTeamsTranscriptSubscription(payload),
    startTeamsTranscriptHistoryInitialImportOrThrow(payload),
  ]);

  if (chatRegistration.status === 'rejected') {
    throw chatRegistration.reason;
  }

  if (transcriptRegistration.status === 'rejected') {
    throw transcriptRegistration.reason;
  }

  if (transcriptHistoryInitialImport.status === 'rejected') {
    throw transcriptHistoryInitialImport.reason;
  }

  return {
    ...chatRegistration.value,
    ...transcriptRegistration.value,
    ...transcriptHistoryInitialImport.value,
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'teams-register-connection',
  description:
    'Runs when a Microsoft Teams connection is added. For a workspace-shared connection with chat enabled, reads the Microsoft tenant id from Graph and claims it for this workspace under the server-scoped teams-tenant:<tenant_id> key, so activities from that tenant route here. Personal connections are left alone. With transcripts enabled, also subscribes to the transcripts of the meetings the account organizes, so Microsoft Graph notifies the app when one is ready, and starts importing the last 31 days of transcripts once per connection.',
  timeoutSeconds: 30,
  handler: teamsRegisterConnectionHandler,
});
