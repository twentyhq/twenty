import { type SlackInboundEvent } from 'src/logic-functions/types/slack-inbound-event.type';

export type SlackEventsRequestBody = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  event?: SlackInboundEvent;
};
