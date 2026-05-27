import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { parseSecretEncryptionEnvelopeOrThrow } from 'src/engine/core-modules/secret-encryption/utils/parse-secret-encryption-envelope-or-throw.util';

// Validates that `value` is a well-formed secret-encryption envelope and
// returns it branded as `EncryptedString`. Use this at every boundary where
// ciphertext re-enters the type system as a raw `string` (raw DB reads,
// migrations, rotation handlers).
//
// The runtime check is the same one decryptVersioned already performs
// internally; the assert helper merely lifts that precondition to the type
// level so call sites cannot accidentally pass plaintext where ciphertext
// is expected.
export const assertEncryptedStringOrThrow = (
  value: string,
): EncryptedString => {
  const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

  if (parsed.version === null) {
    throw new SecretEncryptionException(
      'Expected an encrypted envelope (enc:v2:<keyId>:<payload>) but received a plaintext value.',
      SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
    );
  }

  return value as EncryptedString;
};
