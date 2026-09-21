import { type DiscordDeleteMessageInput } from 'src/logic-functions/types/discord-delete-message-input.type';
import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';
import { buildDiscordFailureResult } from 'src/logic-functions/utils/build-discord-failure-result';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

export const discordDeleteMessageHandler = async (
  parameters: DiscordDeleteMessageInput,
): Promise<DiscordToolResult> => {
  const tokenResult = getDiscordBotToken();

  if (!tokenResult.success) {
    return {
      success: false,
      message: 'Discord is not configured',
      error: tokenResult.error,
    };
  }

  try {
    const result = await discordApiRequest({
      botToken: tokenResult.botToken,
      method: 'DELETE',
      path: `/channels/${encodeURIComponent(
        parameters.channelId,
      )}/messages/${encodeURIComponent(parameters.messageId)}`,
    });

    if (!result.ok) {
      return {
        success: false,
        message: 'Failed to delete Discord message',
        error: result.errorMessage,
      };
    }

    return {
      success: true,
      message: 'Discord message deleted.',
      messageId: parameters.messageId,
      channelId: parameters.channelId,
    };
  } catch (error) {
    return buildDiscordFailureResult('Failed to delete Discord message', error);
  }
};
