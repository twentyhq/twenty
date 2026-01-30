import { Test, type TestingModule } from '@nestjs/testing';

import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

import { SecretEncryptionService } from './secret-encryption.service';

describe('SecretEncryptionService', () => {
  let service: SecretEncryptionService;

  const mockAppSecret = 'mock-app-secret-for-testing-purposes-12345678';
  const testValue = 'my-secret-api-key-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretEncryptionService,
        {
          provide: EnvironmentConfigDriver,
          useValue: {
            get: jest.fn().mockReturnValue(mockAppSecret),
          },
        },
      ],
    }).compile();

    service = module.get<SecretEncryptionService>(SecretEncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a value correctly', () => {
      const encrypted = service.encrypt(testValue);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(testValue);
      expect(encrypted).not.toBe(testValue);
    });

    it('should generate different encrypted values for the same input (due to random IV)', () => {
      const encrypted1 = service.encrypt(testValue);
      const encrypted2 = service.encrypt(testValue);

      expect(encrypted1).not.toBe(encrypted2);

      const decrypted1 = service.decrypt(encrypted1);
      const decrypted2 = service.decrypt(encrypted2);

      expect(decrypted1).toBe(testValue);
      expect(decrypted2).toBe(testValue);
    });

    it('should handle special characters in values', () => {
      const specialValue = 'api-key_WITH@special#chars!123$%^&*()';

      const encrypted = service.encrypt(specialValue);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(specialValue);
    });

    it('should handle empty strings', () => {
      const emptyValue = '';

      const encrypted = service.encrypt(emptyValue);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(emptyValue);
    });

    it('should handle long values', () => {
      const longValue = 'a'.repeat(1000);

      const encrypted = service.encrypt(longValue);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(longValue);
    });

    it('should handle unicode characters', () => {
      const unicodeValue = 'secret-with-émojis-🔐-and-中文';

      const encrypted = service.encrypt(unicodeValue);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(unicodeValue);
    });
  });

  describe('encrypt edge cases', () => {
    it('should return undefined values as-is', () => {
      const result = service.encrypt(undefined as unknown as string);

      expect(result).toBeUndefined();
    });

    it('should return null values as-is', () => {
      const result = service.encrypt(null as unknown as string);

      expect(result).toBeNull();
    });
  });

  describe('decrypt edge cases', () => {
    it('should return undefined values as-is', () => {
      const result = service.decrypt(undefined as unknown as string);

      expect(result).toBeUndefined();
    });

    it('should return null values as-is', () => {
      const result = service.decrypt(null as unknown as string);

      expect(result).toBeNull();
    });
  });

  describe('decryptAndMask', () => {
    const mask = '********';

    it('should return undefined values as-is', () => {
      const result = service.decryptAndMask({
        value: undefined as unknown as string,
        mask,
      });

      expect(result).toBeUndefined();
    });

    it('should return null values as-is', () => {
      const result = service.decryptAndMask({
        value: null as unknown as string,
        mask,
      });

      expect(result).toBeNull();
    });

    it('should return only mask for short secrets (length <= 10)', () => {
      const shortSecret = 'value';
      const encrypted = service.encrypt(shortSecret);

      const result = service.decryptAndMask({ value: encrypted, mask });

      // "value" has 5 chars, floor(5/10) = 0, min(5, 0) = 0, slice(0,0) = ""
      expect(result).toBe(mask);
    });

    it('should return partial value + mask for medium secrets (10 < length <= 50)', () => {
      const mediumSecret = 'sk-abc123def456';
      const encrypted = service.encrypt(mediumSecret);

      const result = service.decryptAndMask({ value: encrypted, mask });

      // "sk-abc123def456" has 15 chars, floor(15/10) = 1, min(5, 1) = 1
      expect(result).toBe(`s${mask}`);
    });

    it('should return partial value + mask for longer secrets', () => {
      const longerSecret = 'sk-abcdefghij1234567890';
      const encrypted = service.encrypt(longerSecret);

      const result = service.decryptAndMask({ value: encrypted, mask });

      // "sk-abcdefghij1234567890" has 23 chars, floor(23/10) = 2, min(5, 2) = 2
      expect(result).toBe(`sk${mask}`);
    });

    it('should cap visible chars at 5 for very long secrets', () => {
      const veryLongSecret = 'a'.repeat(100);
      const encrypted = service.encrypt(veryLongSecret);

      const result = service.decryptAndMask({ value: encrypted, mask });

      // 100 chars, floor(100/10) = 10, min(5, 10) = 5
      expect(result).toBe(`aaaaa${mask}`);
    });

    it('should handle empty secret values', () => {
      const emptySecret = '';
      const encrypted = service.encrypt(emptySecret);

      const result = service.decryptAndMask({ value: encrypted, mask });

      // "" has 0 chars, floor(0/10) = 0, min(5, 0) = 0
      expect(result).toBe(mask);
    });
  });
});
