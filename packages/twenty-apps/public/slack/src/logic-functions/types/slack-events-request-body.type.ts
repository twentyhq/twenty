type SlackEventAuthorization = {
  user_id?: string;
  is_bot?: boolean;
};

type SlackRevokedTokens = {
  oauth?: string[];
  bot?: string[];
};

type SlackSharedLink = {
  url?: string;
  domain?: string;
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
  tokens?: SlackRevokedTokens;
  message_ts?: string;
  unfurl_id?: string;
  source?: string;
  links?: SlackSharedLink[];
  trigger_id?: string;
  external_ref?: { id?: string; type?: string };
  link?: SlackSharedLink;
  entity_url?: string;
};

export type SlackEventsRequestBody = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  authorizations?: SlackEventAuthorization[];
  event?: SlackInboundEvent;
};
