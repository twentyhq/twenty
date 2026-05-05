// Sources are identified by an opaque string supplied as a URL path segment.
// Concrete values are added by each consumer PR (driver migration, inbound
// email, etc.) when they register an InboundWebhookHandler.
export type InboundWebhookSource = string;
