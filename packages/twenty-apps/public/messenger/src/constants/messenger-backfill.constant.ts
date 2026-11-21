// https://developers.facebook.com/docs/messenger-platform/overview/rate-limiting allows 2 Conversations API calls per second per Page
export const MESSENGER_CONVERSATIONS_API_CALL_INTERVAL_MS = 500;
export const MESSENGER_BACKFILL_CONVERSATIONS_PER_PAGE = 25;
// one call for the message ids plus up to 20 for their details, spaced by the call interval
export const MESSENGER_BACKFILL_CONVERSATION_SPACING_MS = 11_000;
