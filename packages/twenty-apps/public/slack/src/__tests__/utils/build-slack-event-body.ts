import { randomUUID } from 'crypto';

import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const SLACK_TEST_TEAM_ID = 'T0TESTTEAM';
export const SLACK_TEST_BOT_USER_ID = 'U0BOTTEST';
export const SLACK_TEST_USER_ID = 'U0HUMANTEST';
export const SLACK_TEST_CHANNEL_ID = 'C0TESTCHANNEL';

export const buildSlackMessageTimestamp = (): string =>
  `${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')}`;

export const buildSlackEventCallbackBody = ({
  event,
  eventId = randomUUID(),
  teamId = SLACK_TEST_TEAM_ID,
  botUserId = SLACK_TEST_BOT_USER_ID,
}: {
  event: SlackEventsRequestBody['event'];
  eventId?: string;
  teamId?: string;
  botUserId?: string;
}): SlackEventsRequestBody => ({
  type: 'event_callback',
  event_id: eventId,
  team_id: teamId,
  authorizations: [{ user_id: botUserId, is_bot: true }],
  event,
});
