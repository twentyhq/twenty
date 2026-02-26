import { Test, type TestingModule } from '@nestjs/testing';

import { AppRegistrationEncryptionService } from 'src/engine/core-modules/app-registration/app-registration-encryption.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('AppRegistrationEncryptionService', () => {
  let service: AppRegistrationEncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRegistrationEncryptionService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-app-secret-32-chars-long!!!'),
          },
        },
      ],
    }).compile();

    service = module.get(AppRegistrationEncryptionService);
  });

  it('should encrypt and decrypt a value', () => {
    const plaintext = 'my-secret-api-key';

    const encrypted = service.encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = service.decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext', () => {
    const plaintext = 'same-value';

    const encrypted1 = service.encrypt(plaintext);
    const encrypted2 = service.encrypt(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
    expect(service.decrypt(encrypted1)).toBe(plaintext);
    expect(service.decrypt(encrypted2)).toBe(plaintext);
  });

  it('should handle empty strings', () => {
    const encrypted = service.encrypt('');

    expect(service.decrypt(encrypted)).toBe('');
  });

  it('should return empty string when decrypting empty input', () => {
    expect(service.decrypt('')).toBe('');
  });
});
