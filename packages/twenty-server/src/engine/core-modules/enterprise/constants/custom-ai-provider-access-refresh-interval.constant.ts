/* @license Enterprise */

// Model resolution reads the entitlement synchronously, so seats are recounted on this cadence rather than per inference.
export const CUSTOM_AI_PROVIDER_ACCESS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
