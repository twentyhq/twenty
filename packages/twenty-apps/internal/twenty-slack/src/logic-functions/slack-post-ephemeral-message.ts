import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { slackPostEphemeralMessageInputSchema } from './schemas/slack-post-ephemeral-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_post_ephemeral_message',
  description:
    'Send a private-on-channel note: only the chosen teammate sees it in that channel (not a DM broadcast to everyone).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackPostEphemeralMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Slack Ephemeral Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slack_channel_id: { type: 'string' },
          recipient_slack_user_id: { type: 'string' },
          message_text: { type: 'string' },
          use_slack_markdown: { type: 'boolean' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          channel: { type: 'string' },
        },
      },
    ],
  },
  handler: slackPostEphemeralMessageHandler,
});
