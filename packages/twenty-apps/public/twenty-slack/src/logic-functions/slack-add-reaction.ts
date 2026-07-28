import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type SlackAddReactionInput } from 'src/logic-functions/types/slack-add-reaction-input.type';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { runSlackReaction } from 'src/logic-functions/utils/run-slack-reaction';
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
  handler: (parameters: SlackAddReactionInput) =>
    runSlackReaction({
      operation: 'add',
      ...parameters,
    }),
});
