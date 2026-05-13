import { type DiscordAddReactionInput } from 'src/logic-functions/types/discord-add-reaction-input.type';
import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { discordToolFailure } from 'src/logic-functions/utils/discord-tool-failure';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

export const discordAddReactionHandler = async (
  parameters: DiscordAddReactionInput,
): Promise<DiscordToolResult> => {
  const tokenResult = getDiscordBotToken();

  if (!tokenResult.success) {
    return {
      success: false,
      message: 'Discord is not configured',
      error: tokenResult.error,
    };
  }

  const emoji = parameters.emoji.trim();

  if (emoji.length === 0) {
    return {
      success: false,
      message: 'Failed to add Discord reaction',
      error: 'An emoji value is required.',
    };
  }

  const encodedEmoji = encodeURIComponent(emoji);

  try {
    const result = await discordApiRequest({
      botToken: tokenResult.botToken,
      method: 'PUT',
      path: `/channels/${encodeURIComponent(
        parameters.channelId,
      )}/messages/${encodeURIComponent(
        parameters.messageId,
      )}/reactions/${encodedEmoji}/@me`,
    });

    if (!result.ok) {
      return {
        success: false,
        message: 'Failed to add Discord reaction',
        error: result.errorMessage,
      };
    }

    return {
      success: true,
      message: `Reaction "${emoji}" added to the message.`,
      messageId: parameters.messageId,
      channelId: parameters.channelId,
    };
  } catch (error) {
    return discordToolFailure('Failed to add Discord reaction', error);
  }
};
