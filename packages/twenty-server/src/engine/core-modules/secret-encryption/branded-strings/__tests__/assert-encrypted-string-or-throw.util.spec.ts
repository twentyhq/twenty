import { assertEncryptedStringOrThrow } from 'src/engine/core-modules/secret-encryption/branded-strings/assert-encrypted-string-or-throw.util';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';

describe('assertEncryptedStringOrThrow', () => {
  // Synthetic v2 envelope: real keys are not relevant — we only validate
  // the envelope shape here, not the cryptographic payload.
  const VALID_ENVELOPE = 'enc:v2:0123abcd:cGF5bG9hZA==';

  it('returns the input branded when it is a well-formed v2 envelope', () => {
    expect(assertEncryptedStringOrThrow(VALID_ENVELOPE)).toBe(VALID_ENVELOPE);
  });

  it('throws MALFORMED_ENVELOPE when the value is plain text', () => {
    expect.assertions(2);
    try {
      assertEncryptedStringOrThrow('my-plaintext-token');
    } catch (error) {
      expect(error).toBeInstanceOf(SecretEncryptionException);
      expect((error as SecretEncryptionException).code).toBe(
        SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      );
    }
  });

  it('throws MALFORMED_ENVELOPE when the v2 envelope is missing the keyId separator', () => {
    expect.assertions(2);
    try {
      assertEncryptedStringOrThrow('enc:v2:onlyKeyIdNoPayload');
    } catch (error) {
      expect(error).toBeInstanceOf(SecretEncryptionException);
      expect((error as SecretEncryptionException).code).toBe(
        SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      );
    }
  });

  it('throws UNKNOWN_ENVELOPE_VERSION for an unknown enc: prefix variant', () => {
    expect.assertions(2);
    try {
      assertEncryptedStringOrThrow('enc:v0:legacy:payload');
    } catch (error) {
      expect(error).toBeInstanceOf(SecretEncryptionException);
      expect((error as SecretEncryptionException).code).toBe(
        SecretEncryptionExceptionCode.UNKNOWN_ENVELOPE_VERSION,
      );
    }
  });
});
