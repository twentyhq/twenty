import { isDefined } from 'twenty-shared/utils';

import { type DiscordPostMessageInput } from 'src/logic-functions/types/discord-post-message-input.type';
import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';
import { buildDiscordFailureResult } from 'src/logic-functions/utils/build-discord-failure-result';
import { discordApiRequest } from 'src/logic-functions/utils/discord-api-request';
import { getDiscordBotToken } from 'src/logic-functions/utils/get-discord-bot-token';

type DiscordMessageResponse = {
  id: string;
  channel_id: string;
};

export const discordPostMessageHandler = async (
  parameters: DiscordPostMessageInput,
): Promise<DiscordToolResult> => {
  const tokenResult = getDiscordBotToken();

  if (!tokenResult.success) {
    return {
      success: false,
      message: 'Discord is not configured',
      error: tokenResult.error,
    };
  }

  const replyToMessageId = parameters.replyToMessageId?.trim();
  const body: Record<string, unknown> = {
    content: parameters.messageText,
  };

  if (isDefined(replyToMessageId) && replyToMessageId.length > 0) {
    body.message_reference = { message_id: replyToMessageId };
  }

  try {
    const result = await discordApiRequest<DiscordMessageResponse>({
      botToken: tokenResult.botToken,
      method: 'POST',
      path: `/channels/${encodeURIComponent(parameters.channelId)}/messages`,
      body,
    });

    if (!result.ok) {
      return {
        success: false,
        message: 'Failed to post Discord message',
        error: result.errorMessage,
      };
    }

    return {
      success: true,
      message: `Message posted to Discord (id=${result.data.id}).`,
      messageId: result.data.id,
      channelId: result.data.channel_id,
    };
  } catch (error) {
    return buildDiscordFailureResult('Failed to post Discord message', error);
  }
};
