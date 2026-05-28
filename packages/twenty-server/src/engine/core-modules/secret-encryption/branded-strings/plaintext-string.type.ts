import { z } from 'zod';
// Hard nominal brand for plaintext secrets (decrypted tokens, user-provided
// passwords, OAuth provider responses) that should never be confused with
// ciphertext or be implicitly persisted unencrypted.
//
// Symmetric counterpart to `EncryptedString`: a raw `string` is not assignable
// to `PlaintextString`, but `PlaintextString` remains assignable to `string`.
//
// Mints are limited to:
// - SecretEncryptionService.decryptVersioned (transformation)
// - Named coercePlaintextFromX helpers, which act as audit-trail entry points
//   for plaintext entering the system (user input, OAuth provider responses).

export const plaintextStringSchema = z.string().brand('PLAINTEXT_STRING_BRAND');

export type PlaintextString = z.infer<typeof plaintextStringSchema>;
