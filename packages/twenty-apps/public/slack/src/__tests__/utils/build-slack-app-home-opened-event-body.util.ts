import { buildSlackEventCallback } from 'src/__tests__/utils/build-slack-event-callback.util';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

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
  buildSlackEventCallback(
    { type: 'app_home_opened', channel: channelId, user: userId, tab },
    { teamId },
  );
