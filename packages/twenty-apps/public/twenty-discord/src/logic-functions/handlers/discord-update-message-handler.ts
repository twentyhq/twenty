import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';
import { type DiscordUpdateMessageInput } from 'src/logic-functions/types/discord-update-message-input.type';
import { buildDiscordFailureResult } from 'src/logic-functions/utils/build-discord-failure-result';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

type DiscordMessageResponse = {
  id: string;
  channel_id: string;
};

export const discordUpdateMessageHandler = async (
  parameters: DiscordUpdateMessageInput,
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
    const result = await discordApiRequest<DiscordMessageResponse>({
      botToken: tokenResult.botToken,
      method: 'PATCH',
      path: `/channels/${encodeURIComponent(
        parameters.channelId,
      )}/messages/${encodeURIComponent(parameters.messageId)}`,
      body: { content: parameters.newMessageText },
    });

    if (!result.ok) {
      return {
        success: false,
        message: 'Failed to update Discord message',
        error: result.errorMessage,
      };
    }

    return {
      success: true,
      message: 'Discord message updated.',
      messageId: result.data.id,
      channelId: result.data.channel_id,
    };
  } catch (error) {
    return buildDiscordFailureResult('Failed to update Discord message', error);
  }
};
