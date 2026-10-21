import { isDefined } from 'twenty-shared/utils';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { parseSecretEncryptionEnvelopeOrThrow } from 'src/engine/core-modules/secret-encryption/utils/parse-secret-encryption-envelope-or-throw.util';

// Pre-2.5 rows hold legacy AES-CTR ciphertext; rows already backfilled hold an
// enc:v2 envelope. The 2.5 encryption backfills must read both.
export const legacyDecryptVersionedWithFallback = ({
  secretEncryptionService,
  value,
  workspaceId,
}: {
  secretEncryptionService: SecretEncryptionService;
  value: EncryptedString;
  workspaceId?: string;
}): PlaintextString => {
  if (!isDefined(value)) {
    return value;
  }

  const parsed = parseSecretEncryptionEnvelopeOrThrow({ value });

  if (parsed.version === 2) {
    return secretEncryptionService.decryptVersionedOrThrow(value, {
      workspaceId,
    });
  }

  return secretEncryptionService.decrypt(value) as PlaintextString;
};
