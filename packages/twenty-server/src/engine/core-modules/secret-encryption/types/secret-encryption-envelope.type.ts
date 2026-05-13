export type ParsedSecretEncryptionEnvelope =
  | { version: 1; payload: string }
  | { version: 2; keyId: string; payload: string }
  | { version: null };
