// TODO: delete this file once the 2.5 cross-upgrade window closes and every
// `core.twoFactorAuthenticationMethod.secret` row is known to be in the
// `enc:v2:` envelope. Also drop `legacyAesCbcPurpose` from SecretEncryptionService
// and the call sites in TwoFactorAuthenticationService and the matching slow
// instance command.
import { createDecipheriv, createHash } from 'crypto';

const LEGACY_AES_CBC_KEY_LENGTH_BYTES = 32;
const LEGACY_AES_CBC_IV_LENGTH_BYTES = 16;

const deriveLegacyAesCbcKey = ({
  appSecret,
  purpose,
}: {
  appSecret: string;
  purpose: string;
}): Buffer => {
  const appSecretHex = createHash('sha256')
    .update(`${appSecret}${purpose}KEY_ENCRYPTION_KEY`)
    .digest('hex');

  return createHash('sha256')
    .update(appSecretHex)
    .digest()
    .subarray(0, LEGACY_AES_CBC_KEY_LENGTH_BYTES);
};

export const LEGACY_AES_CBC_CIPHERTEXT_PATTERN = /^[0-9a-f]{32}:[0-9a-f]+$/i;

export const isLegacyAesCbcCiphertext = (value: string): boolean =>
  LEGACY_AES_CBC_CIPHERTEXT_PATTERN.test(value);

export const decryptLegacyAesCbcOrThrow = ({
  ciphertext,
  appSecret,
  purpose,
}: {
  ciphertext: string;
  appSecret: string;
  purpose: string;
}): string => {
  const separatorIndex = ciphertext.indexOf(':');

  if (separatorIndex !== LEGACY_AES_CBC_IV_LENGTH_BYTES * 2) {
    throw new Error(
      'Malformed legacy AES-CBC ciphertext: expected ivHex:dataHex.',
    );
  }

  const ivHex = ciphertext.slice(0, separatorIndex);
  const dataHex = ciphertext.slice(separatorIndex + 1);

  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const key = deriveLegacyAesCbcKey({ appSecret, purpose });
  const decipher = createDecipheriv('aes-256-cbc', key, iv);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    'utf8',
  );
};
