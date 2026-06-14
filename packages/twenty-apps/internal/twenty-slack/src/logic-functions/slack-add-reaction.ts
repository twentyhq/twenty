import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackAddReactionHandler } from 'src/logic-functions/handlers/slack-add-reaction-handler';
import { slackAddReactionInputSchema } from './schemas/slack-add-reaction-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
  name: 'slack-add-reaction',
  description:
    'Add an emoji reaction to a message (for example a checkmark as `white_check_mark`) so the channel can see status at a glance.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackAddReactionInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Add Slack Reaction',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackAddReactionInputSchema),
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
  handler: slackAddReactionHandler,
});
