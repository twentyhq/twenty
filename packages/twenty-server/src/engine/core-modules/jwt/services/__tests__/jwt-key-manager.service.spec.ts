import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

describe('JwtKeyManagerService (encryption envelope)', () => {
  let service: JwtKeyManagerService;
  let repository: jest.Mocked<Repository<SigningKeyEntity>>;
  let secretEncryptionService: jest.Mocked<SecretEncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtKeyManagerService,
        {
          provide: getRepositoryToken(SigningKeyEntity),
          useValue: {
            findOne: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: CoreEntityCacheService,
          useValue: {
            get: jest.fn(),
            invalidate: jest.fn(),
          },
        },
        {
          provide: SecretEncryptionService,
          useValue: {
            encryptVersioned: jest.fn(
              (value: string) => `enc:v2:deadbeef:${value}|instance`,
            ),
            decryptVersioned: jest.fn((value: string) =>
              value.replace(/^enc:v2:[0-9a-f]+:/, '').replace(/\|.*$/, ''),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(JwtKeyManagerService);
    repository = module.get(getRepositoryToken(SigningKeyEntity));
    secretEncryptionService = module.get(SecretEncryptionService);
  });

  it('decrypts the existing private key via the versioned envelope (instance scope)', async () => {
    const encryptedPem = 'enc:v2:deadbeef:-----PRIVATE-PEM-----|instance';

    repository.findOne.mockResolvedValue({
      id: 'key-id-1',
      publicKey: '-----PUBLIC-PEM-----',
      privateKey: encryptedPem,
      isCurrent: true,
      revokedAt: null,
    } as SigningKeyEntity);

    const result = await service.getCurrentSigningKey();

    expect(result).toEqual({
      id: 'key-id-1',
      privateKeyPem: '-----PRIVATE-PEM-----',
    });
    // Instance scope: no workspaceId is passed.
    expect(secretEncryptionService.decryptVersioned).toHaveBeenCalledWith(
      encryptedPem,
    );
  });

  it('encrypts a newly minted private key with the versioned envelope (instance scope)', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.insert.mockResolvedValue({ identifiers: [] } as never);

    const result = await service.getCurrentSigningKey();

    expect(result).not.toBeNull();
    expect(secretEncryptionService.encryptVersioned).toHaveBeenCalledTimes(1);
    expect(secretEncryptionService.encryptVersioned).toHaveBeenCalledWith(
      expect.stringContaining('PRIVATE KEY'),
    );
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        privateKey: expect.stringMatching(/^enc:v2:deadbeef:/),
        isCurrent: true,
        revokedAt: null,
      }),
    );
  });
});
