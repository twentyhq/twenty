import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { parseSecretEncryptionEnvelopeOrThrow } from 'src/engine/core-modules/secret-encryption/utils/parse-secret-encryption-envelope-or-throw.util';

describe('parseSecretEncryptionEnvelopeOrThrow', () => {
  it('returns version: null for an unprefixed value', () => {
    expect(
      parseSecretEncryptionEnvelopeOrThrow({ value: 'opaque-base64-string' }),
    ).toEqual({ version: null });
  });

  it('returns version: null for the empty string', () => {
    expect(parseSecretEncryptionEnvelopeOrThrow({ value: '' })).toEqual({
      version: null,
    });
  });

  it('parses a v2 envelope, splitting keyId and payload', () => {
    expect(
      parseSecretEncryptionEnvelopeOrThrow({
        value: `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}deadbeef:cipherpayload`,
      }),
    ).toEqual({ version: 2, keyId: 'deadbeef', payload: 'cipherpayload' });
  });

  it('throws MALFORMED_ENVELOPE on a v2 envelope missing the keyId separator', () => {
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({
        value: `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}no-separator`,
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      }) as SecretEncryptionException,
    );
  });

  it('throws MALFORMED_ENVELOPE on a v2 envelope with an empty keyId', () => {
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({
        value: `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}:payload`,
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      }) as SecretEncryptionException,
    );
  });

  it('throws INVALID_KEY_ID_FORMAT when keyId is not 8 hex characters', () => {
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({
        value: `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}NOTHEX!!:payload`,
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.INVALID_KEY_ID_FORMAT,
      }) as SecretEncryptionException,
    );
  });

  it('throws INVALID_KEY_ID_FORMAT when keyId is shorter than 8 chars', () => {
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({
        value: `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}abc:payload`,
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.INVALID_KEY_ID_FORMAT,
      }) as SecretEncryptionException,
    );
  });

  it('throws UNKNOWN_ENVELOPE_VERSION on an unknown envelope version (including the dropped v1)', () => {
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({ value: 'enc:v1:legacy' }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.UNKNOWN_ENVELOPE_VERSION,
      }) as SecretEncryptionException,
    );
    expect(() =>
      parseSecretEncryptionEnvelopeOrThrow({ value: 'enc:v99:whatever' }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.UNKNOWN_ENVELOPE_VERSION,
      }) as SecretEncryptionException,
    );
  });
});
