import {
  SECRET_ENCRYPTION_ENVELOPE_PREFIX,
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
  SECRET_ENCRYPTION_KEY_ID_REGEX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { type ParsedSecretEncryptionEnvelope } from 'src/engine/core-modules/secret-encryption/types/secret-encryption-envelope.type';

export const parseSecretEncryptionEnvelopeOrThrow = ({
  value,
}: {
  value: string;
}): ParsedSecretEncryptionEnvelope => {
  if (!value.startsWith(SECRET_ENCRYPTION_ENVELOPE_PREFIX)) {
    return { version: null };
  }

  if (value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)) {
    const rest = value.slice(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX.length);
    const separatorIndex = rest.indexOf(':');

    if (separatorIndex <= 0) {
      throw new SecretEncryptionException(
        'Malformed enc:v2 envelope: missing keyId separator. Expected enc:v2:<keyId>:<payload>.',
        SecretEncryptionExceptionCode.MALFORMED_ENVELOPE,
      );
    }

    const keyId = rest.slice(0, separatorIndex);
    const payload = rest.slice(separatorIndex + 1);

    if (!SECRET_ENCRYPTION_KEY_ID_REGEX.test(keyId)) {
      throw new SecretEncryptionException(
        `Malformed enc:v2 envelope: keyId '${keyId}' is not 8 hex characters.`,
        SecretEncryptionExceptionCode.INVALID_KEY_ID_FORMAT,
      );
    }

    return { version: 2, keyId, payload };
  }

  throw new SecretEncryptionException(
    `Unknown ciphertext envelope version. Value starts with '${value.slice(0, 16)}'.`,
    SecretEncryptionExceptionCode.UNKNOWN_ENVELOPE_VERSION,
  );
};
