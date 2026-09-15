import { type DiscordAddReactionInput } from 'src/logic-functions/types/discord-add-reaction-input.type';
import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';
import { buildDiscordFailureResult } from 'src/logic-functions/utils/build-discord-failure-result';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
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

  const channelId = parameters.channelId.trim();
  const messageId = parameters.messageId.trim();
  const emoji = parameters.emoji.trim();

  const encodedChannelId = encodeURIComponent(channelId);
  const encodedMessageId = encodeURIComponent(messageId);
  const encodedEmoji = encodeURIComponent(emoji);

  try {
    const result = await discordApiRequest({
      botToken: tokenResult.botToken,
      method: 'PUT',
      path: `/channels/${encodedChannelId}/messages/${encodedMessageId}/reactions/${encodedEmoji}/@me`,
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
      messageId,
      channelId,
    };
  } catch (error) {
    return buildDiscordFailureResult('Failed to add Discord reaction', error);
  }
};
