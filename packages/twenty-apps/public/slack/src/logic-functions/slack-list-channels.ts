import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackListChannelsHandler } from 'src/logic-functions/handlers/slack-list-channels-handler';
import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { slackListChannelsInputSchema } from './schemas/slack-list-channels-input.schema';

export default defineLogicFunction({
  universalIdentifier: SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
  name: 'slack-list-channels',
  description:
    'List Slack channels visible to the bot, with basic metadata (id, name, privacy, archive state, membership, member count, topic, purpose). Useful for picking a channel by name or branching a workflow on whether the bot is a member.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: slackListChannelsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Slack Channels',
    icon: 'IconBrandSlack',
    inputSchema: jsonSchemaToInputSchema(slackListChannelsInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          channels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                isPrivate: { type: 'boolean' },
                isArchived: { type: 'boolean' },
                isMember: { type: 'boolean' },
                numMembers: { type: 'number' },
                topic: { type: 'string' },
                purpose: { type: 'string' },
              },
            },
          },
          count: { type: 'number' },
          error: { type: 'string' },
        },
      },
    ],
  },
  handler: slackListChannelsHandler,
});
