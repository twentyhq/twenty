import { type DiscordListGuildsResult } from 'src/logic-functions/types/discord-list-guilds-output.type';
import { fetchDiscordGuilds } from 'src/logic-functions/utils/fetch-discord-guilds';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

const buildFailureResult = (error: string): DiscordListGuildsResult => ({
  success: false,
  guilds: [],
  count: 0,
  error,
});

export const discordListGuildsHandler =
  async (): Promise<DiscordListGuildsResult> => {
    const tokenResult = getDiscordBotToken();

    if (!tokenResult.success) {
      return buildFailureResult(tokenResult.error);
    }

    const result = await fetchDiscordGuilds(tokenResult.botToken);

    if (!result.ok) {
      return buildFailureResult(result.errorMessage);
    }

    const guilds = result.data.map((guild) => ({
      id: guild.id,
      name: guild.name,
    }));

    return {
      success: true,
      guilds,
      count: guilds.length,
    };
  };
