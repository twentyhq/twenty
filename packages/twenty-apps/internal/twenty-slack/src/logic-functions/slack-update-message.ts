import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { slackUpdateMessageInputSchema } from './schemas/slack-update-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack-update-message',
  description:
    'Change the text of a message this bot already sent. You need the channel ID and the message’s timestamp from when it was posted.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackUpdateMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Update Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackUpdateMessageInputSchema),
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
  handler: slackUpdateMessageHandler,
});
