import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'crypto';

const GCM_IV_LENGTH = 12;
const GCM_TAG_LENGTH = 16;
const DERIVED_KEY_LENGTH = 32;
const HKDF_INFO_PREFIX = 'twenty:enc:v2:';
const INSTANCE_CONTEXT = 'instance';
const ZERO_SALT = Buffer.alloc(32);

const buildInfo = (workspaceId?: string): Buffer =>
  Buffer.from(`${HKDF_INFO_PREFIX}${workspaceId ?? INSTANCE_CONTEXT}`);

const deriveGcmKey = (rawKey: string, workspaceId?: string): Buffer => {
  const derived = hkdfSync(
    'sha256',
    Buffer.from(rawKey),
    ZERO_SALT,
    buildInfo(workspaceId),
    DERIVED_KEY_LENGTH,
  );

  return Buffer.from(derived);
};

export const encryptAesGcmV2 = (
  plaintext: string,
  rawKey: string,
  workspaceId?: string,
): string => {
  const key = deriveGcmKey(rawKey, workspaceId);
  const iv = randomBytes(GCM_IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, authTag]).toString('base64');
};

export const decryptAesGcmV2 = (
  payloadBase64: string,
  rawKey: string,
  workspaceId?: string,
): string => {
  const buffer = Buffer.from(payloadBase64, 'base64');

  if (buffer.length < GCM_IV_LENGTH + GCM_TAG_LENGTH) {
    throw new Error('v2 ciphertext payload is too short');
  }

  const iv = buffer.subarray(0, GCM_IV_LENGTH);
  const authTag = buffer.subarray(buffer.length - GCM_TAG_LENGTH);
  const ciphertext = buffer.subarray(
    GCM_IV_LENGTH,
    buffer.length - GCM_TAG_LENGTH,
  );

  const key = deriveGcmKey(rawKey, workspaceId);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
};
