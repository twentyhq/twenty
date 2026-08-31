import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_SET_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackSetUserLinkHandler } from 'src/logic-functions/handlers/slack-set-user-link-handler';
import { slackSetUserLinkInputSchema } from './schemas/slack-set-user-link-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_SET_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'slack-set-user-link',
  description:
    'Link a Slack user to a workspace member so the assistant acts with that member permissions. Restricted to members with the workspace members permission; the link is stored with source MANUAL and wins over email matching.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackSetUserLinkInputSchema,
  },
  handler: slackSetUserLinkHandler,
});
