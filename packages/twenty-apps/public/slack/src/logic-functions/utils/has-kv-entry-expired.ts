import { isNumber } from '@sniptt/guards';

// kv hands back whatever was stored, so an entry can reach us without a usable
// expiry; treat that as expired rather than trusting it forever.
export const hasKvEntryExpired = (entry: { expiresAt?: number }): boolean =>
  !isNumber(entry.expiresAt) || entry.expiresAt <= Date.now();
