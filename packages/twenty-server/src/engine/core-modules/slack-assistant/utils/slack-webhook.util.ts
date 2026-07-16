import { createHmac, timingSafeEqual } from 'crypto';

// Slack signs each request as `v0:{timestamp}:{rawBody}` with the app signing
// secret (HMAC-SHA256). See https://api.slack.com/authentication/verifying-requests-from-slack
const SLACK_SIGNATURE_VERSION = 'v0';
const DEFAULT_MAX_SKEW_SECONDS = 5 * 60;

export const verifySlackSignature = ({
  body,
  signature,
  timestamp,
  signingSecret,
  maxSkewSeconds = DEFAULT_MAX_SKEW_SECONDS,
  now = Date.now,
}: {
  body: string;
  signature: string;
  timestamp: string;
  signingSecret: string;
  maxSkewSeconds?: number;
  now?: () => number;
}): boolean => {
  const timestampSeconds = Number(timestamp);

  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor(now() / 1000);

  if (Math.abs(nowSeconds - timestampSeconds) > maxSkewSeconds) {
    return false;
  }

  const expectedSignature = `${SLACK_SIGNATURE_VERSION}=${createHmac(
    'sha256',
    signingSecret,
  )
    .update(`${SLACK_SIGNATURE_VERSION}:${timestamp}:${body}`)
    .digest('hex')}`;

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
};

type SlackMessageEvent = {
  teamId?: string;
  enterpriseId?: string;
  channelId: string;
  threadTs: string;
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
  | { kind: 'unsupported' };

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
    text: asString(event.text),
    teamId:
      asOptionalString(event.team_id) ?? asOptionalString(envelope.team_id),
    enterpriseId:
      asOptionalString(envelope.enterprise_id) ??
      asOptionalString(envelope.context_enterprise_id),
    userId: asOptionalString(event.user),
    eventId: asOptionalString(envelope.event_id),
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

  if (event.type === 'app_mention') {
    return { kind: 'app_mention', ...buildMessageEvent(envelope, event) };
  }

  if (event.type === 'message' && event.channel_type === 'im') {
    return {
      kind: 'direct_message',
      botId: asOptionalString(event.bot_id),
      subtype: asOptionalString(event.subtype),
      ...buildMessageEvent(envelope, event),
    };
  }

  return { kind: 'unsupported' };
};
