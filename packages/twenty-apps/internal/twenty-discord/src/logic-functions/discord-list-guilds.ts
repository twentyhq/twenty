import { defineLogicFunction } from 'twenty-sdk/define';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

import { DISCORD_LIST_GUILDS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordListGuildsHandler } from 'src/logic-functions/handlers/discord-list-guilds-handler';
import { discordListGuildsInputSchema } from './schemas/discord-list-guilds-input.schema';

export default defineLogicFunction({
  universalIdentifier: DISCORD_LIST_GUILDS_UNIVERSAL_IDENTIFIER,
  name: 'discord-list-guilds',
  description:
    'List the Discord servers (guilds) the bot has been invited to. Each entry exposes `id` and `name`. Use this to discover which servers the bot can post in, then pass the chosen server ID to `discord-list-channels` or other server-scoped actions.',
  timeoutSeconds: 30,
  toolTriggerSettings: {
    inputSchema: discordListGuildsInputSchema,
  },
  workflowActionTriggerSettings: {
    label: 'List Discord Servers',
    icon: 'IconBrandDiscord',
    inputSchema: jsonSchemaToInputSchema(discordListGuildsInputSchema),
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          guilds: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          count: { type: 'number' },
          error: { type: 'string' },
        },
      },
    ],
  },
  handler: discordListGuildsHandler,
});
