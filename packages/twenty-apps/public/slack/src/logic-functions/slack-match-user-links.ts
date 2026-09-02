import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_MATCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_MATCH_USER_LINKS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackMatchUserLinksHandler } from 'src/logic-functions/handlers/slack-match-user-links-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_MATCH_USER_LINKS_UNIVERSAL_IDENTIFIER,
  name: 'slack-match-user-links',
  description:
    'Matches every Slack workspace user against workspace members by verified email and stores the resulting links. Restricted to members with the roles permission.',
  timeoutSeconds: 120,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_MATCH_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackMatchUserLinksHandler,
});
