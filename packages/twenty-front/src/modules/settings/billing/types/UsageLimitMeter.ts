// Mirrors the server's USAGE_METERS. 'bytes' only ever reaches stock limits,
// which the workspace quota form does not offer.
export type UsageLimitMeter = 'creditsUsedMicro' | 'quantity' | 'bytes';
