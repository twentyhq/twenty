import { type SlackMessageEventOptions } from 'src/__tests__/types/slack-message-event-options.type';
import { buildSlackEventCallback } from 'src/__tests__/utils/build-slack-event-callback.util';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

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
  buildSlackEventCallback(
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
