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
});
