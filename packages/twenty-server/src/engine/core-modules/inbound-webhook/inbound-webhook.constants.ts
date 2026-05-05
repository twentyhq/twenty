// Default replay window for HMAC-signed sources. Inbound timestamps older
// than this are rejected to defeat replay attacks.
export const INBOUND_WEBHOOK_REPLAY_WINDOW_MS = 5 * 60 * 1000;

// Idempotency lock TTL — duplicate inbound events within this window are
// dropped. 7d covers retry policies of all current providers.
export const INBOUND_WEBHOOK_IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Renewal cron pattern. Runs hourly — well below shortest provider expiry
// (Microsoft Graph: 3 days; Gmail watch: 7 days).
export const INBOUND_WEBHOOK_RENEWAL_CRON_PATTERN = '0 * * * *';

// Renewal buffer — refresh subscriptions that expire within this window.
export const INBOUND_WEBHOOK_RENEWAL_BUFFER_MS = 6 * 60 * 60 * 1000;
