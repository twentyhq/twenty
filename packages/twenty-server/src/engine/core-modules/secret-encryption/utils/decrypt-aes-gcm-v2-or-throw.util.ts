import { createDecipheriv } from 'crypto';

import {
  SECRET_ENCRYPTION_GCM_IV_LENGTH,
  SECRET_ENCRYPTION_GCM_TAG_LENGTH,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { deriveGcmKey } from 'src/engine/core-modules/secret-encryption/utils/derive-gcm-key.util';

export const decryptAesGcmV2OrThrow = ({
  payloadBase64,
  rawKey,
  workspaceId,
}: {
  payloadBase64: string;
  rawKey: string;
  workspaceId?: string;
}): string => {
  const buffer = Buffer.from(payloadBase64, 'base64');

  if (
    buffer.length <
    SECRET_ENCRYPTION_GCM_IV_LENGTH + SECRET_ENCRYPTION_GCM_TAG_LENGTH
  ) {
    throw new SecretEncryptionException(
      'v2 ciphertext payload is too short to contain an IV and an auth tag.',
      SecretEncryptionExceptionCode.CIPHERTEXT_TOO_SHORT,
    );
  }

  const iv = buffer.subarray(0, SECRET_ENCRYPTION_GCM_IV_LENGTH);
  const authTag = buffer.subarray(
    buffer.length - SECRET_ENCRYPTION_GCM_TAG_LENGTH,
  );
  const ciphertext = buffer.subarray(
    SECRET_ENCRYPTION_GCM_IV_LENGTH,
    buffer.length - SECRET_ENCRYPTION_GCM_TAG_LENGTH,
  );

  const key = deriveGcmKey({ rawKey, workspaceId });
  const decipher = createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
};
