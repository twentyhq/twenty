import { Test, type TestingModule } from '@nestjs/testing';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { SimpleSecretEncryptionUtil } from './simple-secret-encryption.util';

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
              .mockImplementation((_type, purpose) => {
                // Return different secrets for different purposes to simulate real behavior
                return `${mockAppSecret}-${purpose}`;
              }),
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

  describe('encryptSecret and decryptSecret', () => {
    it('should encrypt and decrypt a secret correctly', async () => {
      const encrypted = await util.encryptSecret(testSecret, testPurpose);
      const decrypted = await util.decryptSecret(encrypted, testPurpose);

      expect(decrypted).toBe(testSecret);
      expect(encrypted).not.toBe(testSecret);
      expect(encrypted).toContain(':'); // Should contain IV separator
    });

    it('should generate different encrypted values for the same secret', async () => {
      const encrypted1 = await util.encryptSecret(testSecret, testPurpose);
      const encrypted2 = await util.encryptSecret(testSecret, testPurpose);

      expect(encrypted1).not.toBe(encrypted2); // Different IVs should produce different results

      const decrypted1 = await util.decryptSecret(encrypted1, testPurpose);
      const decrypted2 = await util.decryptSecret(encrypted2, testPurpose);

      expect(decrypted1).toBe(testSecret);
      expect(decrypted2).toBe(testSecret);
    });

    it('should use the correct JWT token type and purpose', async () => {
      await util.encryptSecret(testSecret, testPurpose);

      expect(jwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
        testPurpose,
      );
    });

    it('should handle special characters in secrets', async () => {
      const specialSecret = 'SECRET-WITH_SPECIAL@CHARS#123!';

      const encrypted = await util.encryptSecret(specialSecret, testPurpose);
      const decrypted = await util.decryptSecret(encrypted, testPurpose);

      expect(decrypted).toBe(specialSecret);
    });

    it('should fail to decrypt with wrong purpose', async () => {
      const encrypted = await util.encryptSecret(testSecret, testPurpose);

      await expect(
        util.decryptSecret(encrypted, 'wrong-purpose'),
      ).rejects.toThrow();
    });

    it('should fail to decrypt malformed encrypted data', async () => {
      await expect(
        util.decryptSecret('invalid-encrypted-data', testPurpose),
      ).rejects.toThrow();
    });

    it('should handle empty secrets', async () => {
      const emptySecret = '';

      const encrypted = await util.encryptSecret(emptySecret, testPurpose);
      const decrypted = await util.decryptSecret(encrypted, testPurpose);

      expect(decrypted).toBe(emptySecret);
    });
  });
});
