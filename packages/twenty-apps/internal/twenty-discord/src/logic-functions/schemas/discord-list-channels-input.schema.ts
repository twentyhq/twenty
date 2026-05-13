import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordListChannelsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    guildId: {
      type: 'string',
      label: 'Discord server (guild) ID',
      multiline: false,
      description:
        'The Discord server ID to list channels for (a long number like `1234567890123456789`). In Discord with Developer Mode on: right-click the server icon → "Copy Server ID". The bot must be a member of this server. Discord bot tokens are global, not per-server, so this ID is required to scope the listing.',
    },
  },
  required: ['guildId'],
  additionalProperties: false,
};
