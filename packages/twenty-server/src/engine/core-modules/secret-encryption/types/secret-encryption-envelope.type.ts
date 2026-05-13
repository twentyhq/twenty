export type ParsedSecretEncryptionEnvelope =
  | { version: 2; keyId: string; payload: string }
  | { version: null };
