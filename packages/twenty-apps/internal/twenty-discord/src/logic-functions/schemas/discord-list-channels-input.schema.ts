import { type InputJsonSchema } from 'twenty-sdk/logic-function';

export const discordListChannelsInputSchema: InputJsonSchema = {
  type: 'object',
  properties: {
    guildId: {
      type: 'string',
      label: 'Discord server (guild) ID',
      description:
        'Optional. The Discord server ID to list channels for (a long number like `1234567890123456789`). In Discord with Developer Mode on: right-click the server icon → "Copy Server ID". If omitted and the bot is in exactly one server, that server is used automatically; if the bot is in multiple servers, the error response lists each server name and ID so you can pick one.',
    },
  },
  required: [],
  additionalProperties: false,
};
