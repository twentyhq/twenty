export const INBOUND_WEBHOOK_SOURCES = [
  'google-messaging',
  'google-calendar',
  'microsoft-messaging',
  'microsoft-calendar',
  'inbound-email-ses',
] as const;

export type InboundWebhookSource = (typeof INBOUND_WEBHOOK_SOURCES)[number];

export const isInboundWebhookSource = (
  value: unknown,
): value is InboundWebhookSource =>
  typeof value === 'string' &&
  (INBOUND_WEBHOOK_SOURCES as readonly string[]).includes(value);
