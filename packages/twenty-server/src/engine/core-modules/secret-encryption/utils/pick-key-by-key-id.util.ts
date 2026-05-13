import { computeKeyId } from './key-id.util';
import { type ResolvedEncryptionKeys } from './key-resolution.util';

// Picks the raw key whose fingerprint matches the keyId stamped on a v2
// envelope. Used by decryption to route directly to primary or fallback
// instead of trial-decrypting both. Throws with the missing fingerprint
// so operators can identify which key needs to be supplied via
// FALLBACK_ENCRYPTION_KEY.
export const pickKeyByKeyId = (
  keyId: string,
  keys: ResolvedEncryptionKeys,
): string => {
  if (computeKeyId(keys.primary) === keyId) {
    return keys.primary;
  }

  if (keys.fallback !== null && computeKeyId(keys.fallback) === keyId) {
    return keys.fallback;
  }

  throw new Error(
    `No encryption key matches keyId '${keyId}'. Configure FALLBACK_ENCRYPTION_KEY with the key that encrypted this row.`,
  );
};
