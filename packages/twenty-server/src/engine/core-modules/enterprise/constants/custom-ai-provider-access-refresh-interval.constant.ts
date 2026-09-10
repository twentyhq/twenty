/* @license Enterprise */

// Model resolution reads the entitlement synchronously, so seats are counted on
// this cadence instead: an instance that crosses the threshold keeps resolving
// its custom models for at most this long. Well under the daily seat report,
// and one COUNT per hour per process is far cheaper than one per inference.
export const CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
