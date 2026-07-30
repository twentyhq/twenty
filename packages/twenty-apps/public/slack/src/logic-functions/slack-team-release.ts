import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_TEAM_RELEASE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackTeamReleaseHandler } from 'src/logic-functions/handlers/slack-team-release-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_TEAM_RELEASE_UNIVERSAL_IDENTIFIER,
  name: 'slack-team-release',
  description:
    'Runs when a Slack connection is removed (via the connection provider onDisconnect hook). Releases the server-scoped slack-team:<team_id> claim this workspace took on connect so another workspace can connect the same Slack team.',
  timeoutSeconds: 30,
  handler: slackTeamReleaseHandler,
});
