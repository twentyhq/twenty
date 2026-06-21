import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type SlackMessageBodyFormat } from 'src/logic-functions/types/slack-message-body-format.type';

const VALID_MESSAGE_FORMATS: SlackMessageBodyFormat[] = ['plain', 'markdown'];

const isSlackMessageBodyFormat = (
  value: unknown,
): value is SlackMessageBodyFormat =>
  typeof value === 'string' &&
  VALID_MESSAGE_FORMATS.includes(value as SlackMessageBodyFormat);

const handler = async (event: RoutePayload) => {
  const body = event.body as Record<string, unknown> | null;

  return slackPostMessageHandler({
    slackChannelId: (body?.slackChannelId as string | undefined) ?? '',
    messageText: (body?.messageText as string | undefined) ?? '',
    parentMessageTimestamp: body?.parentMessageTimestamp as string | undefined,
    messageFormat: isSlackMessageBodyFormat(body?.messageFormat)
      ? body.messageFormat
      : undefined,
  });
};

export default defineLogicFunction({
  universalIdentifier: SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-post-message-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/slack/messages',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
