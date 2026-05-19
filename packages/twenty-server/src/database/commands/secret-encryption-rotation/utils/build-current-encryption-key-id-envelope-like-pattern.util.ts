import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

export const buildCurrentEncryptionKeyIdEnvelopeLikePattern = (
  currentEncryptionKeyId: string,
): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${currentEncryptionKeyId}:%`;

export const ANY_V2_ENVELOPE_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;
