import { isNonEmptyArray } from '@sniptt/guards';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findTeamsTenantClaimConflicts } from 'src/features/chat/logic-functions/utils/find-teams-tenant-claim-conflicts';
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
        action: { label: 'Open connections', location: '#general/connections' },
      };
    }

    if (connections.every((connection) => isDefined(connection.authFailedAt))) {
      return {
        status: 'ERROR',
        title: 'Microsoft Teams connection needs to be reconnected',
        description:
          'Microsoft rejected the stored credentials, so meeting transcripts are no longer imported. Remove the Microsoft Teams connection and add it again.',
        action: {
          label: 'Manage connection',
          location: '#general/connections',
        },
      };
    }

    if (!isTeamsChatEnabled()) {
      return { status: 'OK' };
    }

    const workingWorkspaceConnections = connections.filter(
      (connection) =>
        connection.scope === 'WORKSPACE' && !isDefined(connection.authFailedAt),
    );

    if (!isNonEmptyArray(workingWorkspaceConnections)) {
      return {
        status: 'WARNING',
        title: 'Microsoft Teams chat needs a workspace connection',
        description:
          'Chat only answers messages from the Microsoft organization of a working workspace-shared connection, and personal connections do not count. Add a workspace connection, or reconnect the existing one, to use chat.',
        action: { label: 'Open connections', location: '#general/connections' },
      };
    }

    const claimConflicts = await findTeamsTenantClaimConflicts({
      connectedAccountIds: workingWorkspaceConnections.map(
        (connection) => connection.id,
      ),
    });

    if (isNonEmptyArray(claimConflicts)) {
      return {
        status: 'ERROR',
        title: 'Microsoft Teams chat is taken by another workspace',
        description:
          'Another Twenty workspace already connected this Microsoft organization, and Teams messages from an organization can only reach one workspace. Transcripts still import here. To use chat here, disconnect Microsoft Teams in that workspace, then remove and add the connection again in this one.',
        action: {
          label: 'Manage connection',
          location: '#general/connections',
        },
      };
    }

    return { status: 'OK' };
  };

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'teams-health-check',
  description:
    'Warns on the app settings page when no Microsoft Teams account is connected, every connection needs to be reconnected, or another workspace already holds the Microsoft organization chat needs, since transcripts and chat both rely on a connection.',
  timeoutSeconds: 30,
  handler: teamsHealthCheckHandler,
});
