import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

export const buildPrimaryEncryptionKeyIdEnvelopeLikePattern = (
  primaryEncryptionKeyId: string,
): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${primaryEncryptionKeyId}:%`;

export const ANY_V2_ENVELOPE_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;
