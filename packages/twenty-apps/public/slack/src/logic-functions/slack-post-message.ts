import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { slackPostMessageInputSchema } from './schemas/slack-post-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack-post-message',
  description:
    'Send a message to a Slack channel or DM. Optionally reply inside an existing thread using the parent message’s timestamp from a previous step.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackPostMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Slack Message',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackPostMessageInputSchema),
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
  handler: slackPostMessageHandler,
});
