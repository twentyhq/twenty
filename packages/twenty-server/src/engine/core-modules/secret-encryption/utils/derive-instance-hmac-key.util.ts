import { hkdfSync } from 'crypto';

import {
  INSTANCE_HMAC_DERIVED_KEY_LENGTH,
  INSTANCE_HMAC_HKDF_INFO_PREFIX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

const ZERO_SALT = Buffer.alloc(32);

export const deriveInstanceHmacKey = ({
  rawKey,
  purpose,
}: {
  rawKey: string;
  purpose: string;
}): Buffer =>
  Buffer.from(
    hkdfSync(
      'sha256',
      Buffer.from(rawKey),
      ZERO_SALT,
      Buffer.from(`${INSTANCE_HMAC_HKDF_INFO_PREFIX}${purpose}`),
      INSTANCE_HMAC_DERIVED_KEY_LENGTH,
    ),
  );
