import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { DISCORD_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordPostMessageHandler } from 'src/logic-functions/handlers/discord-post-message-handler';

const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;
  const rawChannelId = body?.channelId;
  const rawMessageText = body?.messageText;

  if (typeof rawChannelId !== 'string' || typeof rawMessageText !== 'string') {
    return {
      success: false,
      message: 'Failed to post Discord message',
      error: '`channelId` and `messageText` must be strings.',
    };
  }

  const channelId = rawChannelId.trim();
  const messageText = rawMessageText.trim();

  if (channelId.length === 0 || messageText.length === 0) {
    return {
      success: false,
      message: 'Failed to post Discord message',
      error: '`channelId` and `messageText` are required.',
    };
  }

  return discordPostMessageHandler({ channelId, messageText });
};

export default defineLogicFunction({
  universalIdentifier: DISCORD_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'discord-post-message-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/discord/messages',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
