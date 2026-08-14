import { createHmac } from 'crypto';

import { type RoutePayload } from 'twenty-sdk/define';

import { SLACK_TEST_WEBHOOK_SECRET } from 'src/__tests__/utils/setup-slack-integration-test';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const signSlackRequest = ({
  rawBody,
  timestampSeconds,
  secret = SLACK_TEST_WEBHOOK_SECRET,
}: {
  rawBody: string;
  timestampSeconds: number;
  secret?: string;
}): string =>
  `v0=${createHmac('sha256', secret)
    .update(`v0:${timestampSeconds}:${rawBody}`, 'utf8')
    .digest('hex')}`;

export const buildSlackRoutePayload = (
  body: SlackEventsRequestBody,
  {
    secret,
    timestampSeconds = Math.floor(Date.now() / 1000),
    signature,
    rawBody,
  }: {
    secret?: string;
    timestampSeconds?: number;
    signature?: string;
    rawBody?: string;
  } = {},
): RoutePayload<SlackEventsRequestBody> => {
  const serializedBody = rawBody ?? JSON.stringify(body);

  return {
    headers: {
      'x-slack-signature':
        signature ??
        signSlackRequest({
          rawBody: serializedBody,
          timestampSeconds,
          secret,
        }),
      'x-slack-request-timestamp': String(timestampSeconds),
    },
    queryStringParameters: {},
    pathParameters: {},
    body,
    rawBody: serializedBody,
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/slack/events' } },
    userWorkspaceId: null,
  };
};

type SlackMessageEventOptions = {
  channelId: string;
  text: string;
  userId?: string;
  messageTimestamp?: string;
  threadTimestamp?: string;
  channelType?: string;
  eventId?: string;
  teamId?: string;
  botUserId?: string;
  botId?: string;
  subtype?: string;
};

const buildEventCallback = (
  event: NonNullable<SlackEventsRequestBody['event']>,
  {
    eventId = `Ev${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    teamId,
    botUserId,
  }: { eventId?: string; teamId?: string; botUserId?: string },
): SlackEventsRequestBody => ({
  type: 'event_callback',
  event_id: eventId,
  team_id: teamId,
  authorizations:
    botUserId === undefined
      ? undefined
      : [{ user_id: botUserId, is_bot: true }],
  event,
});

export const buildSlackAppMentionEventBody = ({
  channelId,
  text,
  userId = 'U0REQUESTER',
  messageTimestamp = '1700000100.000100',
  threadTimestamp,
  channelType = 'channel',
  eventId,
  teamId,
  botUserId,
}: SlackMessageEventOptions): SlackEventsRequestBody =>
  buildEventCallback(
    {
      type: 'app_mention',
      channel: channelId,
      channel_type: channelType,
      user: userId,
      text,
      ts: messageTimestamp,
      thread_ts: threadTimestamp,
    },
    { eventId, teamId, botUserId },
  );

export const buildSlackMessageEventBody = ({
  channelId,
  text,
  userId = 'U0REQUESTER',
  messageTimestamp = '1700000100.000200',
  threadTimestamp,
  channelType = 'im',
  eventId,
  teamId,
  botUserId,
  botId,
  subtype,
}: SlackMessageEventOptions): SlackEventsRequestBody =>
  buildEventCallback(
    {
      type: 'message',
      channel: channelId,
      channel_type: channelType,
      user: userId,
      text,
      ts: messageTimestamp,
      thread_ts: threadTimestamp,
      bot_id: botId,
      subtype,
    },
    { eventId, teamId, botUserId },
  );

export const buildSlackMemberJoinedChannelEventBody = ({
  channelId,
  userId,
  teamId,
}: {
  channelId: string;
  userId: string;
  teamId?: string;
}): SlackEventsRequestBody =>
  buildEventCallback(
    { type: 'member_joined_channel', channel: channelId, user: userId },
    { teamId },
  );

export const buildSlackAppHomeOpenedEventBody = ({
  channelId,
  userId = 'U0REQUESTER',
  tab = 'messages',
  teamId,
}: {
  channelId: string;
  userId?: string;
  tab?: string;
  teamId?: string;
}): SlackEventsRequestBody =>
  buildEventCallback(
    { type: 'app_home_opened', channel: channelId, user: userId, tab },
    { teamId },
  );
