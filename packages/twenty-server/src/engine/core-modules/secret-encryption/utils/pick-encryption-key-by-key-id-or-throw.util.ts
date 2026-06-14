import { isDefined } from 'twenty-shared/utils';

import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { type ResolvedEncryptionKeys } from 'src/engine/core-modules/secret-encryption/types/resolved-encryption-keys.type';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';

export const pickEncryptionKeyByKeyIdOrThrow = ({
  keyId,
  keys,
}: {
  keyId: string;
  keys: ResolvedEncryptionKeys;
}): string => {
  if (computeEncryptionKeyId({ rawKey: keys.primary }) === keyId) {
    return keys.primary;
  }

  if (
    isDefined(keys.fallback) &&
    computeEncryptionKeyId({ rawKey: keys.fallback }) === keyId
  ) {
    return keys.fallback;
  }

  throw new SecretEncryptionException(
    `No encryption key matches keyId '${keyId}'. Configure FALLBACK_ENCRYPTION_KEY with the key that encrypted this row.`,
    SecretEncryptionExceptionCode.UNKNOWN_KEY_ID,
  );
};
