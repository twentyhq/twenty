import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordDeleteMessageHandler } from 'src/logic-functions/handlers/discord-delete-message-handler';
import { discordDeleteMessageInputSchema } from './schemas/discord-delete-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'discord-delete-message',
  description:
    'Remove a Discord message this bot sent (for example after a mistake or when a workflow is cancelled).',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordDeleteMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Delete Discord Message',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordDeleteMessageInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' },
          messageId: { type: 'string' },
          channelId: { type: 'string' },
        },
      },
    ],
  },
  handler: discordDeleteMessageHandler,
});
