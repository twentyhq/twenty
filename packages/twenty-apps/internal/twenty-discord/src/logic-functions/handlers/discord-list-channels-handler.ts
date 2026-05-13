import { isDefined } from 'twenty-shared/utils';

import { type DiscordListChannelsInput } from 'src/logic-functions/types/discord-list-channels-input.type';
import {
  type DiscordListChannelsResult,
  type DiscordListChannelsResultChannel,
} from 'src/logic-functions/types/discord-list-channels-output.type';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

// Discord channel type enum from the gateway docs:
// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
// We expose only the two text-postable, top-level guild channel types — the
// kinds workflow steps can actually send messages to. Voice channels, threads,
// forums, categories, and DM-likes are intentionally excluded.
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

export const discordListChannelsHandler = async (
  parameters: DiscordListChannelsInput,
): Promise<DiscordListChannelsResult> => {
  const tokenResult = getDiscordBotToken();

  if (!tokenResult.success) {
    return {
      success: false,
      channels: [],
      count: 0,
      error: tokenResult.error,
    };
  }

  const guildId = parameters.guildId.trim();

  if (guildId.length === 0) {
    return {
      success: false,
      channels: [],
      count: 0,
      error: 'A Discord server (guild) ID is required.',
    };
  }

  const result = await discordApiRequest<DiscordChannelResponse[]>({
    botToken: tokenResult.botToken,
    method: 'GET',
    path: `/guilds/${encodeURIComponent(guildId)}/channels`,
  });

  if (!result.ok) {
    return {
      success: false,
      channels: [],
      count: 0,
      error: result.errorMessage,
    };
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
