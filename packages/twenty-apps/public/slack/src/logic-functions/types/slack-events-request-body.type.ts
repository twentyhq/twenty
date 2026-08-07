type SlackEventAuthorization = {
  user_id?: string;
  is_bot?: boolean;
};

type SlackInboundEvent = {
  type?: string;
  subtype?: string;
  channel_type?: string;
  bot_id?: string;
  user?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  channel?: string;
};

export type SlackEventsRequestBody = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  authorizations?: SlackEventAuthorization[];
  event?: SlackInboundEvent;
};
