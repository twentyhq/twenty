import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_POST_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordPostMessageHandler } from 'src/logic-functions/handlers/discord-post-message-handler';
import { discordPostMessageInputSchema } from './schemas/discord-post-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'discord-post-message',
  description:
    'Send a message to a Discord channel as the bot. Optionally reply to an existing message using its message ID from a previous step.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordPostMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Send Discord Message',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordPostMessageInputSchema),
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
  handler: discordPostMessageHandler,
});
