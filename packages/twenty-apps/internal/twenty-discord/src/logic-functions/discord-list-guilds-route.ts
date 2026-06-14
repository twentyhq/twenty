import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

import { DISCORD_LIST_GUILDS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordListGuildsHandler } from 'src/logic-functions/handlers/discord-list-guilds-handler';

const handler = async (_event: RoutePayload) => {
  return discordListGuildsHandler();
};

export default defineLogicFunction({
  universalIdentifier: DISCORD_LIST_GUILDS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'discord-list-guilds-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/discord/guilds',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
