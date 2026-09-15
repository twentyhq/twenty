import { buildSlackEventCallback } from 'src/__tests__/utils/build-slack-event-callback.util';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const buildSlackMemberJoinedChannelEventBody = ({
  channelId,
  userId,
  teamId,
}: {
  channelId: string;
  userId: string;
  teamId?: string;
}): SlackEventsRequestBody =>
  buildSlackEventCallback(
    { type: 'member_joined_channel', channel: channelId, user: userId },
    { teamId },
  );
