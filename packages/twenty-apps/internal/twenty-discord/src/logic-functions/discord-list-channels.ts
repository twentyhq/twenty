import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_LIST_CHANNELS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordListChannelsHandler } from 'src/logic-functions/handlers/discord-list-channels-handler';
import { discordListChannelsInputSchema } from './schemas/discord-list-channels-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
  name: 'discord-list-channels',
  description:
    'List the text-postable channels (types `GUILD_TEXT` and `GUILD_ANNOUNCEMENT`) in a Discord server, sorted by Discord position. Each entry exposes `id`, `name`, `type`, `parentId` (category), and `position`. Pass the server (guild) ID to scope the listing; if omitted and the bot is in exactly one server, that server is auto-selected. If the bot is in multiple servers, the error response lists each server name and ID for explicit selection. Voice channels, threads, forums, and categories are excluded.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordListChannelsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Discord Channels',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordListChannelsInputSchema),
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
                type: { type: 'number' },
                parentId: { type: 'string' },
                position: { type: 'number' },
              },
            },
          },
          count: { type: 'number' },
          error: { type: 'string' },
        },
      },
    ],
  },
  handler: discordListChannelsHandler,
});
