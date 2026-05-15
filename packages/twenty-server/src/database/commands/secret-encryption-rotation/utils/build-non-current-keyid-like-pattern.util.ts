import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

// Returns the SQL LIKE pattern matching every v2 envelope NOT currently
// encrypted with the given primary keyId. Use it as
//   `value LIKE 'enc:v2:%' AND value NOT LIKE <pattern>`
// to build an idempotent rotation filter.
export const buildPrimaryKeyIdEnvelopeLikePattern = (
  primaryKeyId: string,
): string => `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${primaryKeyId}:%`;

export const ANY_V2_ENVELOPE_LIKE_PATTERN = `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%`;
