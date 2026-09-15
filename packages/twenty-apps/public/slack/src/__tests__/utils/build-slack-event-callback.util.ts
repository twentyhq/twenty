import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';

export const buildSlackEventCallback = (
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
