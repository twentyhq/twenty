import { hkdfSync } from 'crypto';

import {
  SECRET_ENCRYPTION_DERIVED_KEY_LENGTH,
  SECRET_ENCRYPTION_HKDF_INFO_PREFIX,
  SECRET_ENCRYPTION_INSTANCE_CONTEXT,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

const ZERO_SALT = Buffer.alloc(32);

export const deriveGcmKey = ({
  rawKey,
  workspaceId,
}: {
  rawKey: string;
  workspaceId?: string;
}): Buffer =>
  Buffer.from(
    hkdfSync(
      'sha256',
      Buffer.from(rawKey),
      ZERO_SALT,
      Buffer.from(
        `${SECRET_ENCRYPTION_HKDF_INFO_PREFIX}${
          workspaceId ?? SECRET_ENCRYPTION_INSTANCE_CONTEXT
        }`,
      ),
      SECRET_ENCRYPTION_DERIVED_KEY_LENGTH,
    ),
  );
