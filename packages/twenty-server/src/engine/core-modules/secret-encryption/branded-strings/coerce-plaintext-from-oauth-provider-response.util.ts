import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// Named entry point for plaintext returned by external OAuth providers
// (Google, Microsoft, app OAuth refresh, etc.). The cast is a no-op at
// runtime; the helper exists so callsites carry an audit-trail name
// rather than ad-hoc `as PlaintextString`.
export const coercePlaintextFromOAuthProviderResponse = (
  value: string,
): PlaintextString => value as PlaintextString;
