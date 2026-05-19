import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

export const buildPrimaryKeyIdEnvelopeLikePattern = (
  primaryKeyId: string,
): string => `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${primaryKeyId}:%`;

export const ANY_V2_ENVELOPE_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;
