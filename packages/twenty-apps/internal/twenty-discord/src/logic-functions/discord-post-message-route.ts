import type { RoutePayload } from 'twenty-sdk/define';
import { defineLogicFunction } from 'twenty-sdk/define';

import { DISCORD_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { discordPostMessageHandler } from 'src/logic-functions/handlers/discord-post-message-handler';

const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;
  const channelId = body?.channelId as string | undefined;
  const messageText = body?.messageText as string | undefined;

  if (!channelId || !messageText) {
    return {
      success: false,
      message: 'Failed to post Discord message',
      error: 'Both `channelId` and `messageText` are required.',
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
