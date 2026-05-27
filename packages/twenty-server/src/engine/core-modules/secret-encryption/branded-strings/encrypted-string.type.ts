declare const ENCRYPTED_STRING_BRAND: unique symbol;

// Hard nominal brand for ciphertext produced by SecretEncryptionService.
// A raw `string` is not assignable to `EncryptedString` (the brand key is
// not optional), but an `EncryptedString` remains assignable to `string`
// so logging, DB writes, GraphQL responses and other read-only consumers
// continue to work without ceremony.
//
// The only sanctioned mints are inside the secret-encryption module:
// - SecretEncryptionService.encryptVersioned (transformation)
// - assertEncryptedStringOrThrow (runtime envelope validation)
// Any other `as EncryptedString` is a code-review-level concern.
export type EncryptedString = string & {
  readonly [ENCRYPTED_STRING_BRAND]: true;
};
