import { isDefined } from 'twenty-shared/utils';

import {
  type SlackMessageEvent,
  type SlackWebhookPayload,
} from 'src/engine/core-modules/slack-assistant/types/slack-webhook-payload.type';

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const asOptionalString = (value: unknown): string | undefined =>
  asString(value) || undefined;

const buildMessageEvent = (
  envelope: Record<string, unknown>,
  event: Record<string, unknown>,
): SlackMessageEvent => {
  const ts = asString(event.ts);

  return {
    channelId: asString(event.channel),
    threadTs: asString(event.thread_ts) || ts,
    ts,
    text: asString(event.text),
    teamId:
      asOptionalString(event.team_id) ?? asOptionalString(envelope.team_id),
    enterpriseId:
      asOptionalString(envelope.enterprise_id) ??
      asOptionalString(envelope.context_enterprise_id),
    userId: asOptionalString(event.user),
  };
};

export const parseSlackWebhookBody = (rawBody: string): SlackWebhookPayload => {
  let raw: unknown;

  try {
    raw = JSON.parse(rawBody);
  } catch {
    return { kind: 'unsupported' };
  }

  const envelope = asRecord(raw);

  if (!envelope) {
    return { kind: 'unsupported' };
  }

  if (
    envelope.type === 'url_verification' &&
    typeof envelope.challenge === 'string'
  ) {
    return { kind: 'url_verification', challenge: envelope.challenge };
  }

  const event = asRecord(envelope.event);

  if (envelope.type !== 'event_callback' || !event) {
    return { kind: 'unsupported' };
  }

  switch (event.type) {
    case 'app_mention':
      return { kind: 'app_mention', ...buildMessageEvent(envelope, event) };
    case 'message': {
      const messageMeta = {
        botId: asOptionalString(event.bot_id),
        subtype: asOptionalString(event.subtype),
      };

      if (event.channel_type === 'im') {
        return {
          kind: 'direct_message',
          ...messageMeta,
          ...buildMessageEvent(envelope, event),
        };
      }

      if (
        (event.channel_type === 'channel' || event.channel_type === 'group') &&
        isDefined(asOptionalString(event.thread_ts))
      ) {
        return {
          kind: 'channel_message',
          ...messageMeta,
          ...buildMessageEvent(envelope, event),
        };
      }

      break;
    }
  }

  return { kind: 'unsupported' };
};
