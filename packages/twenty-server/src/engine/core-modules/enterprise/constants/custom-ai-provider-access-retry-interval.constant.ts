/* @license Enterprise */

// A count that failed leaves a verdict that may be wrong in either direction, so
// it is retried far sooner than a successful one is refreshed. Still an interval
// rather than an immediate retry: a database that stays down would otherwise put
// a count back on the path of every single model resolution.
export const CUSTOM_AI_PROVIDER_ACCESS_RETRY_INTERVAL_MS = 60 * 1000;
