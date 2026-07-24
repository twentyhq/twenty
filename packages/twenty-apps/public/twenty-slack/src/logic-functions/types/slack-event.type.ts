export type SlackEventsRequestBody = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  event?: SlackInboundEvent;
};

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

export type SlackAssistantRequestDraft = {
  slackEventId: string;
  slackChannelId: string;
  slackChannelType: string;
  slackThreadTimestamp: string;
  slackMessageTimestamp: string;
  slackUserId: string;
  requestText: string;
};

export type ParsedSlackAssistantRequest =
  | {
      request: SlackAssistantRequestDraft;
      requiresActiveThreadSubscription: boolean;
    }
  | { request: null; skipReason: string };
