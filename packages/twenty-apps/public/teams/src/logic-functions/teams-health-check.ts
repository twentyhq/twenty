import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-provider-name';
import { isTeamsTranscriptImportEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-import-enabled';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const teamsHealthCheckHandler =
  async (): Promise<ApplicationHealthCheckResult> => {
    const isChatEnabled = isFeatureEnabled({
      isAvailable: RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED,
      settingValue: process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY],
    });

    if (!isChatEnabled && !isTeamsTranscriptImportEnabled()) {
      return { status: 'OK' };
    }

    const connections = await listConnections({
      providerName: TEAMS_PROVIDER_NAME,
    });

    if (connections.length === 0) {
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
