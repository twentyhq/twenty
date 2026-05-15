import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordUpdateMessageHandler } from 'src/logic-functions/handlers/discord-update-message-handler';
import { discordUpdateMessageInputSchema } from './schemas/discord-update-message-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'discord-update-message',
  description:
    'Change the text of a Discord message this bot already sent. You need the channel ID and the message ID from when it was posted.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordUpdateMessageInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'Update Discord Message',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordUpdateMessageInputSchema),
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
  handler: discordUpdateMessageHandler,
});
