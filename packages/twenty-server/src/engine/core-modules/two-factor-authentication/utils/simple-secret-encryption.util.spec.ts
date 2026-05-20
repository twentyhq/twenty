import { Test, type TestingModule } from '@nestjs/testing';

import { createCipheriv, createHash, randomBytes } from 'crypto';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { SimpleSecretEncryptionUtil } from './simple-secret-encryption.util';

// Mirrors the production write path the util used to perform; kept inside
// the spec so the deprecated decryptSecret can still be exercised end-to-end
// without shipping an encrypt method.
const encryptLegacySecret = ({
  plaintext,
  appSecret,
}: {
  plaintext: string;
  appSecret: string;
}): string => {
  const encryptionKey = createHash('sha256')
    .update(appSecret)
    .digest()
    .slice(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

describe('SimpleSecretEncryptionUtil', () => {
  let util: SimpleSecretEncryptionUtil;
  let jwtWrapperService: any;

  const mockAppSecret = 'mock-app-secret-for-testing-purposes-12345678';
  const testSecret = 'KVKFKRCPNZQUYMLXOVYDSKLMNBVCXZ';
  const testPurpose = 'user123workspace456otp-secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimpleSecretEncryptionUtil,
        {
          provide: JwtWrapperService,
          useValue: {
            generateAppSecret: jest
              .fn()
              .mockImplementation(
                (_type, purpose) => `${mockAppSecret}-${purpose}`,
              ),
          },
        },
      ],
    }).compile();

    util = module.get<SimpleSecretEncryptionUtil>(SimpleSecretEncryptionUtil);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(util).toBeDefined();
  });

  describe('decryptSecret', () => {
    it('decrypts a legacy ciphertext produced with the matching purpose', async () => {
      const appSecret = `${mockAppSecret}-${testPurpose}`;
      const encrypted = encryptLegacySecret({
        plaintext: testSecret,
        appSecret,
      });

      const decrypted = await util.decryptSecret(encrypted, testPurpose);

      expect(decrypted).toBe(testSecret);
    });

    it('uses the KEY_ENCRYPTION_KEY JWT token type and the provided purpose', async () => {
      const appSecret = `${mockAppSecret}-${testPurpose}`;
      const encrypted = encryptLegacySecret({
        plaintext: testSecret,
        appSecret,
      });

      await util.decryptSecret(encrypted, testPurpose);

      expect(jwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
        testPurpose,
      );
    });

    it('handles special characters in plaintext', async () => {
      const specialSecret = 'SECRET-WITH_SPECIAL@CHARS#123!';
      const appSecret = `${mockAppSecret}-${testPurpose}`;
      const encrypted = encryptLegacySecret({
        plaintext: specialSecret,
        appSecret,
      });

      const decrypted = await util.decryptSecret(encrypted, testPurpose);

      expect(decrypted).toBe(specialSecret);
    });

    it('does not recover the plaintext when the purpose is wrong', async () => {
      const appSecret = `${mockAppSecret}-${testPurpose}`;
      const encrypted = encryptLegacySecret({
        plaintext: testSecret,
        appSecret,
      });

      // AES-256-CBC with a different key may either throw (invalid padding)
      // or produce garbage. Both outcomes are acceptable - the key property is
      // that the original secret is never returned.
      try {
        const decrypted = await util.decryptSecret(encrypted, 'wrong-purpose');

        expect(decrypted).not.toBe(testSecret);
      } catch {
        // Expected: wrong key produced invalid padding.
      }
    });

    it('throws on malformed ciphertext', async () => {
      await expect(
        util.decryptSecret('invalid-encrypted-data', testPurpose),
      ).rejects.toThrow();
    });
  });
});
