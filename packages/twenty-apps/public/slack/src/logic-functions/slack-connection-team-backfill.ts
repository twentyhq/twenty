import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { SLACK_CONNECTION_TEAM_BACKFILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackConnectionTeamBackfillHandler } from 'src/logic-functions/handlers/slack-connection-team-backfill-handler';

export default definePostInstallLogicFunction({
  universalIdentifier: SLACK_CONNECTION_TEAM_BACKFILL_UNIVERSAL_IDENTIFIER,
  name: 'slack-connection-team-backfill',
  description:
    'Runs after install and after every upgrade. Records the Slack team of any connection that predates the connected account to team mapping, so its claim can be released on disconnect or uninstall.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: true,
  handler: slackConnectionTeamBackfillHandler,
});
