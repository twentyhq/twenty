export type SlackMessageEvent = {
  teamId?: string;
  enterpriseId?: string;
  channelId: string;
  threadTs: string;
  ts: string;
  text: string;
  userId?: string;
  eventId?: string;
};

export type SlackWebhookPayload =
  | { kind: 'url_verification'; challenge: string }
  | ({ kind: 'app_mention' } & SlackMessageEvent)
  | ({
      kind: 'direct_message';
      botId?: string;
      subtype?: string;
    } & SlackMessageEvent)
  | ({
      kind: 'channel_message';
      botId?: string;
      subtype?: string;
    } & SlackMessageEvent)
  | { kind: 'unsupported' };
