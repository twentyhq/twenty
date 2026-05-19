import { createCipheriv, randomBytes } from 'crypto';

import { SECRET_ENCRYPTION_GCM_IV_LENGTH } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { deriveGcmKey } from 'src/engine/core-modules/secret-encryption/utils/derive-gcm-key.util';

export const encryptAesGcmV2 = ({
  plaintext,
  rawKey,
  workspaceId,
}: {
  plaintext: string;
  rawKey: string;
  workspaceId?: string;
}): string => {
  const key = deriveGcmKey({ rawKey, workspaceId });
  const iv = randomBytes(SECRET_ENCRYPTION_GCM_IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, authTag]).toString('base64');
};
