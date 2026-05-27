import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// Named entry point for plaintext supplied by the user (IMAP/SMTP/CALDAV
// passwords from the GraphQL resolver, manually entered secrets, etc.). The
// cast is a no-op at runtime; the helper exists so callsites carry an
// audit-trail name rather than ad-hoc `as PlaintextString`.
export const coercePlaintextFromUserInput = (
  value: string,
): PlaintextString => value as PlaintextString;
