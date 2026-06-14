import type { RoutePayload } from 'twenty-sdk/define';
import { defineLogicFunction } from 'twenty-sdk/define';

import { DISCORD_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordListChannelsHandler } from 'src/logic-functions/handlers/discord-list-channels-handler';

const handler = async (event: RoutePayload) => {
  const params = event.queryStringParameters ?? {};
  const guildId =
    typeof params.guildId === 'string' && params.guildId.length > 0
      ? params.guildId
      : undefined;

  return discordListChannelsHandler({ guildId });
};

export default defineLogicFunction({
  universalIdentifier: DISCORD_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'discord-list-channels-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/discord/channels',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
