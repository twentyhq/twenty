import {
  discordApiRequest,
  type DiscordApiResult,
} from 'src/logic-functions/utils/discord-api-request';

export type DiscordGuildResponse = {
  id: string;
  name: string;
};

export const fetchDiscordGuilds = (
  botToken: string,
): Promise<DiscordApiResult<DiscordGuildResponse[]>> =>
  discordApiRequest<DiscordGuildResponse[]>({
    botToken,
    method: 'GET',
    path: '/users/@me/guilds',
  });
