import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackDeleteMessageHandler } from 'src/logic-functions/handlers/slack-delete-message-handler';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { slackDeleteMessageInputSchema } from './schemas/slack-delete-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack-delete-message',
  description:
    'Remove a message this bot sent (for example after a mistake or when a workflow is cancelled).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackDeleteMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Delete Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackDeleteMessageInputSchema),
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
