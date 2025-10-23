import { Test, type TestingModule } from '@nestjs/testing';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

describe('SecretEncryptionService', () => {
  let service: SecretEncryptionService;
  let environmentConfigDriver: EnvironmentConfigDriver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretEncryptionService,
        {
          provide: EnvironmentConfigDriver,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SecretEncryptionService>(SecretEncryptionService);
    environmentConfigDriver = module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    );

    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should return the original value if value is undefined', () => {
      const result = service.encrypt(undefined as any);

      expect(result).toBeUndefined();
    });

    it('should return the original value if value is null', () => {
      const result = service.encrypt(null as any);

      expect(result).toBeNull();
    });

    it('should return the original value if value is empty string', () => {
      const result = service.encrypt('');

      expect(result).toBe('');
    });

    it('should encrypt the value successfully', () => {
      const value = 'test-secret';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const result = service.encrypt(value);

      expect(result).not.toBe(value);
      expect(result).toBeDefined();
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
    });

    it('should return original value if encryption fails', () => {
      const value = 'test-secret';
      const appSecret = '';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const result = service.encrypt(value);

      expect(result).not.toBe(value);
    });
  });

  describe('decrypt', () => {
    it('should return the original value if value is undefined', () => {
      const result = service.decrypt(undefined as any);

      expect(result).toBeUndefined();
    });

    it('should return the original value if value is null', () => {
      const result = service.decrypt(null as any);

      expect(result).toBeNull();
    });

    it('should return the original value if value is empty string', () => {
      const result = service.decrypt('');

      expect(result).toBe('');
    });

    it('should decrypt the value successfully', async () => {
      const value = 'test-secret';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const encryptedValue = service.encrypt(value);

      expect(encryptedValue).not.toBe(value);

      const result = service.decrypt(encryptedValue);

      expect(result).toBe(value);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
    });

    it('should return original value if decryption fails', () => {
      const invalidEncryptedValue = 'invalid-encrypted-data';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const result = service.decrypt(invalidEncryptedValue);

      expect(result).toBe('');
    });
  });

  describe('decryptAndMask', () => {
    it('should return the original value if value is undefined', () => {
      const result = service.decryptAndMask(undefined as any);

      expect(result).toBeUndefined();
    });

    it('should return the original value if value is null', () => {
      const result = service.decryptAndMask(null as any);

      expect(result).toBeNull();
    });

    it('should return the original value if value is empty string', () => {
      const result = service.decryptAndMask('');

      expect(result).toBe('');
    });

    it('should mask short decrypted value (length <= 8)', () => {
      const value = 'short';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const encryptedValue = service.encrypt(value);

      expect(encryptedValue).not.toBe(value);

      const result = service.decryptAndMask(encryptedValue);

      expect(result).toBe('*****');
    });

    it('should mask long decrypted value (length > 8)', () => {
      const value = 'very-long-secret-value';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const encryptedValue = service.encrypt(value);

      expect(encryptedValue).not.toBe(value);

      // Then decrypt and mask it
      const result = service.decryptAndMask(encryptedValue);

      const expectedMask = '********' + 'et-value';

      expect(result).toBe(expectedMask);
    });

    it('should mask decrypted value with exact mask length (length = 8)', () => {
      const value = 'exactlen';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      // First encrypt the value
      const encryptedValue = service.encrypt(value);

      expect(encryptedValue).not.toBe(value);

      // Then decrypt and mask it
      const result = service.decryptAndMask(encryptedValue);

      expect(result).toBe('********');
    });

    it('should mask very long decrypted value with max 8 asterisks', () => {
      const value =
        'this-is-a-very-long-secret-value-that-should-be-masked-properly';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const encryptedValue = service.encrypt(value);

      expect(encryptedValue).not.toBe(value);

      const result = service.decryptAndMask(encryptedValue);

      // Should always be exactly 8 asterisks + last 8 characters
      const expectedMask = '********' + value.slice(-8);

      expect(result).toBe(expectedMask);
    });

    it('should handle decryption failure and mask the original value', () => {
      const invalidEncryptedValue = 'invalid-encrypted-data';
      const appSecret = 'test-app-secret';

      (environmentConfigDriver.get as jest.Mock).mockReturnValue(appSecret);

      const result = service.decryptAndMask(invalidEncryptedValue);

      expect(result).toBe('');
    });
  });
});
