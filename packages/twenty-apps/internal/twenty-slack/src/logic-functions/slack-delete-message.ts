import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackDeleteMessageHandler } from 'src/logic-functions/handlers/slack-delete-message-handler';
import { slackDeleteMessageInputSchema } from './schemas/slack-delete-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack_delete_message',
  description:
    'Remove a message this bot sent (for example after a mistake or when a workflow is cancelled).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackDeleteMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Delete Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: [
      {
        type: 'object',
        properties: {
          slackChannelId: { type: 'string' },
          messageTimestamp: { type: 'string' },
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
          slackTs: { type: 'string' },
          channel: { type: 'string' },
        },
      },
    ],
  },
  handler: slackDeleteMessageHandler,
});
