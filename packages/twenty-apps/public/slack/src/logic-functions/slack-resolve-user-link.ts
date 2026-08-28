import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_RESOLVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_RESOLVE_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackResolveUserLinkHandler } from 'src/logic-functions/handlers/slack-resolve-user-link-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_RESOLVE_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'slack-resolve-user-link',
  description:
    'Resolves a Slack account from an email or Slack user id so an admin can confirm the right person before linking. Restricted to members with the workspace members permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_RESOLVE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackResolveUserLinkHandler,
});
