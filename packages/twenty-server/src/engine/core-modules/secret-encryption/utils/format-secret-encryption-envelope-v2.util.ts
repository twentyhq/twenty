import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

export const formatSecretEncryptionEnvelopeV2 = ({
  keyId,
  payloadBase64,
}: {
  keyId: string;
  payloadBase64: string;
}): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${keyId}:${payloadBase64}`;
