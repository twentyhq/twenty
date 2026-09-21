import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { slackPostEphemeralMessageInputSchema } from './schemas/slack-post-ephemeral-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'slack-post-ephemeral-message',
  description:
    'Send a private-on-channel note: only the chosen teammate sees it in that channel (not a DM broadcast to everyone).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackPostEphemeralMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Slack Ephemeral Message',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackPostEphemeralMessageInputSchema),
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
