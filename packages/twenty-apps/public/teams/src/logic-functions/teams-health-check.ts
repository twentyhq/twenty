import { isNonEmptyArray } from '@sniptt/guards';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { isTeamsTranscriptImportEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-import-enabled';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';

export const teamsHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => {
    if (!isTeamsChatEnabled() && !isTeamsTranscriptImportEnabled()) {
      return { status: 'OK' };
    }

    const connections = await listTeamsConnections();

    if (!isNonEmptyArray(connections)) {
      return {
        status: 'WARNING',
        title: 'Microsoft Teams is not connected',
        description:
          'No working Microsoft Teams connection was found in this workspace, so the app cannot reach Teams. Add a connection to start importing meeting transcripts.',
        action: { label: 'Add connection', location: '#general' },
      };
    }

    if (connections.every((connection) => isDefined(connection.authFailedAt))) {
      return {
        status: 'ERROR',
        title: 'Microsoft Teams connection needs to be reconnected',
        description:
          'Microsoft rejected the stored credentials, so meeting transcripts are no longer imported. Remove the Microsoft Teams connection and add it again.',
        action: { label: 'Manage connection', location: '#general' },
      };
    }

    // Only a workspace-shared connection claims the Microsoft tenant chat routes on.
    const hasWorkingWorkspaceConnection = connections.some(
      (connection) =>
        connection.scope === 'WORKSPACE' && !isDefined(connection.authFailedAt),
    );

    if (isTeamsChatEnabled() && !hasWorkingWorkspaceConnection) {
      return {
        status: 'WARNING',
        title: 'Microsoft Teams chat needs a workspace connection',
        description:
          'Chat only answers messages from the Microsoft organization of a working workspace-shared connection, and personal connections do not count. Add a workspace connection, or reconnect the existing one, to use chat.',
        action: { label: 'Add connection', location: '#general' },
      };
    }

    return { status: 'OK' };
  };

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'teams-health-check',
  description:
    'Warns on the app settings page when no Microsoft Teams account is connected or every connection needs to be reconnected, since transcripts and chat both rely on a connection.',
  timeoutSeconds: 30,
  handler: teamsHealthCheckHandler,
});
