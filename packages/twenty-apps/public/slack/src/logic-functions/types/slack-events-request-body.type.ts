type SlackEventAuthorization = {
  user_id?: string;
  is_bot?: boolean;
};

type SlackSharedLink = {
  url?: string;
  domain?: string;
};

type SlackRevokedTokens = {
  oauth?: string[];
  bot?: string[];
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
  tab?: string;
  links?: SlackSharedLink[];
  message_ts?: string;
  source?: string;
  unfurl_id?: string;
  tokens?: SlackRevokedTokens;
};

export type SlackEventsRequestBody = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  authorizations?: SlackEventAuthorization[];
  event?: SlackInboundEvent;
};
