import { Raw } from 'typeorm';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

export const buildCurrentEncryptionKeyIdEnvelopeLikePattern = (
  currentEncryptionKeyId: string,
): string =>
  `${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${currentEncryptionKeyId}:%`;

export const buildNonCurrentEnvelopeRawFilter = (
  currentEncryptionKeyId: string,
) =>
  Raw<string>((alias) => `${alias} NOT LIKE :current`, {
    current: buildCurrentEncryptionKeyIdEnvelopeLikePattern(
      currentEncryptionKeyId,
    ),
  });
