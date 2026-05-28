declare const ENCRYPTED_STRING_BRAND: unique symbol;

// Hard nominal brand for ciphertext produced by SecretEncryptionService.
// A raw `string` is not assignable to `EncryptedString` (the brand key is
// not optional), but an `EncryptedString` remains assignable to `string`
// so logging, DB writes, GraphQL responses and other read-only consumers
// continue to work without ceremony.
//
// The canonical mint is SecretEncryptionService.encryptVersioned.
// Call sites reading encrypted columns from the DB may use
// `as EncryptedString` to satisfy the branded parameter.
export type EncryptedString = string & {
  readonly [ENCRYPTED_STRING_BRAND]: true;
};
