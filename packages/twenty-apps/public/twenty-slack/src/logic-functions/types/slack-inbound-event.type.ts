export type SlackInboundEvent = {
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
