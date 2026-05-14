import { isDefined } from 'twenty-shared/utils';

import { type DiscordListChannelsInput } from 'src/logic-functions/types/discord-list-channels-input.type';
import {
  type DiscordListChannelsResult,
  type DiscordListChannelsResultChannel,
} from 'src/logic-functions/types/discord-list-channels-output.type';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { fetchDiscordGuilds } from 'src/logic-functions/utils/fetch-discord-guilds';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

const GUILD_TEXT_CHANNEL_TYPE = 0;
const GUILD_ANNOUNCEMENT_CHANNEL_TYPE = 5;

const POSTABLE_CHANNEL_TYPES = new Set<number>([
  GUILD_TEXT_CHANNEL_TYPE,
  GUILD_ANNOUNCEMENT_CHANNEL_TYPE,
]);

type DiscordChannelResponse = {
  id: string;
  name: string | null;
  type: number;
  parent_id: string | null;
  position: number;
};

const buildFailureResult = (error: string): DiscordListChannelsResult => ({
  success: false,
  channels: [],
  count: 0,
  error,
});

const resolveGuildId = async ({
  botToken,
  providedGuildId,
}: {
  botToken: string;
  providedGuildId: string | undefined;
}): Promise<{ ok: true; guildId: string } | { ok: false; error: string }> => {
  const trimmed = providedGuildId?.trim();

  if (isDefined(trimmed) && trimmed.length > 0) {
    return { ok: true, guildId: trimmed };
  }

  const guildsResult = await fetchDiscordGuilds(botToken);

  if (!guildsResult.ok) {
    return { ok: false, error: guildsResult.errorMessage };
  }

  const guilds = guildsResult.data;

  if (guilds.length === 0) {
    return {
      ok: false,
      error:
        'Bot has not been invited to any Discord server yet. Use the OAuth2 → URL Generator in the Discord Developer Portal (scope `bot`) to invite it to a server, then retry.',
    };
  }

  if (guilds.length > 1) {
    const guildList = guilds
      .map((guild) => `"${guild.name}" (${guild.id})`)
      .join(', ');

    return {
      ok: false,
      error: `Bot is in ${guilds.length} Discord servers — please specify which one via the guildId input. Available: ${guildList}.`,
    };
  }

  return { ok: true, guildId: guilds[0].id };
};

export const discordListChannelsHandler = async (
  parameters: DiscordListChannelsInput,
): Promise<DiscordListChannelsResult> => {
  const tokenResult = getDiscordBotToken();

  if (!tokenResult.success) {
    return buildFailureResult(tokenResult.error);
  }

  const guildIdResult = await resolveGuildId({
    botToken: tokenResult.botToken,
    providedGuildId: parameters.guildId,
  });

  if (!guildIdResult.ok) {
    return buildFailureResult(guildIdResult.error);
  }

  const result = await discordApiRequest<DiscordChannelResponse[]>({
    botToken: tokenResult.botToken,
    method: 'GET',
    path: `/guilds/${encodeURIComponent(guildIdResult.guildId)}/channels`,
  });

  if (!result.ok) {
    return buildFailureResult(result.errorMessage);
  }

  const channels: DiscordListChannelsResultChannel[] = result.data
    .filter(
      (channel) =>
        POSTABLE_CHANNEL_TYPES.has(channel.type) && isDefined(channel.name),
    )
    .map((channel) => ({
      id: channel.id,
      name: channel.name as string,
      type: channel.type,
      parentId: channel.parent_id,
      position: channel.position,
    }))
    .sort((a, b) => a.position - b.position);

  return {
    success: true,
    channels,
    count: channels.length,
  };
};
