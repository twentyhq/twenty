import { type SlackMessageEventOptions } from 'src/__tests__/types/slack-message-event-options.type';
import { buildSlackEventCallback } from 'src/__tests__/utils/build-slack-event-callback.util';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

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
  buildSlackEventCallback(
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
