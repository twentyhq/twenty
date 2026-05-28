import { SECRET_ENCRYPTION_ENVELOPE_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';

// Soft type predicate: narrows `string` to `EncryptedString` when the
// value carries the versioned envelope prefix (`enc:`). Returns false
// for plaintext AND for legacy unprefixed AES-CTR ciphertext, since
// neither can be distinguished from arbitrary input by shape alone.
//
// Use this when a caller needs to branch on "is this in the versioned
// envelope?" without throwing.
export const isEncryptedString = (value: string): value is EncryptedString =>
  value.startsWith(SECRET_ENCRYPTION_ENVELOPE_PREFIX);
