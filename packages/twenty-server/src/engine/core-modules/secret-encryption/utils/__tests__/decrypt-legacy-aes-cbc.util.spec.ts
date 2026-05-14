import { createCipheriv, createHash, randomBytes } from 'crypto';

import {
  decryptLegacyAesCbcOrThrow,
  isLegacyAesCbcCiphertext,
} from 'src/engine/core-modules/secret-encryption/utils/decrypt-legacy-aes-cbc.util';

const encryptLegacyAesCbc = ({
  plaintext,
  appSecret,
  purpose,
}: {
  plaintext: string;
  appSecret: string;
  purpose: string;
}): string => {
  const appSecretHex = createHash('sha256')
    .update(`${appSecret}${purpose}KEY_ENCRYPTION_KEY`)
    .digest('hex');
  const key = createHash('sha256')
    .update(appSecretHex)
    .digest()
    .subarray(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

describe('decryptLegacyAesCbcOrThrow', () => {
  const APP_SECRET = 'integration-test-app-secret-1234567890abcdef';
  const USER_ID = '11111111-1111-1111-1111-111111111111';
  const WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';
  const OTP_PURPOSE = `${USER_ID}${WORKSPACE_ID}otp-secret`;
  const PLAINTEXT = 'KVKFKRCPNZQUYMLXOVYDSKLMNBVCXZ';

  it('round-trips a TOTP-shaped legacy ciphertext', () => {
    const ciphertext = encryptLegacyAesCbc({
      plaintext: PLAINTEXT,
      appSecret: APP_SECRET,
      purpose: OTP_PURPOSE,
    });

    expect(isLegacyAesCbcCiphertext(ciphertext)).toBe(true);

    const decrypted = decryptLegacyAesCbcOrThrow({
      ciphertext,
      appSecret: APP_SECRET,
      purpose: OTP_PURPOSE,
    });

    expect(decrypted).toBe(PLAINTEXT);
  });

  it('fails to recover the plaintext when the purpose differs', () => {
    const ciphertext = encryptLegacyAesCbc({
      plaintext: PLAINTEXT,
      appSecret: APP_SECRET,
      purpose: OTP_PURPOSE,
    });

    let recovered: string | undefined;

    try {
      recovered = decryptLegacyAesCbcOrThrow({
        ciphertext,
        appSecret: APP_SECRET,
        purpose: 'wrong-purpose',
      });
    } catch {
      recovered = undefined;
    }

    expect(recovered).not.toBe(PLAINTEXT);
  });

  it('fails to recover the plaintext when the app secret differs', () => {
    const ciphertext = encryptLegacyAesCbc({
      plaintext: PLAINTEXT,
      appSecret: APP_SECRET,
      purpose: OTP_PURPOSE,
    });

    let recovered: string | undefined;

    try {
      recovered = decryptLegacyAesCbcOrThrow({
        ciphertext,
        appSecret: 'different-app-secret',
        purpose: OTP_PURPOSE,
      });
    } catch {
      recovered = undefined;
    }

    expect(recovered).not.toBe(PLAINTEXT);
  });

  it('rejects malformed ciphertext (missing iv separator)', () => {
    expect(() =>
      decryptLegacyAesCbcOrThrow({
        ciphertext: 'nothexcolonshape',
        appSecret: APP_SECRET,
        purpose: OTP_PURPOSE,
      }),
    ).toThrow(/Malformed legacy AES-CBC/);
  });

  describe('isLegacyAesCbcCiphertext', () => {
    it('matches 32-hex IV + colon + hex payload', () => {
      const sample = `${'a'.repeat(32)}:${'b'.repeat(32)}`;

      expect(isLegacyAesCbcCiphertext(sample)).toBe(true);
    });

    it('does not match an enc:v2 envelope', () => {
      expect(isLegacyAesCbcCiphertext('enc:v2:abcdef01:somepayload')).toBe(
        false,
      );
    });

    it('does not match base64 legacy CTR ciphertext', () => {
      expect(
        isLegacyAesCbcCiphertext(
          'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=',
        ),
      ).toBe(false);
    });
  });
});
