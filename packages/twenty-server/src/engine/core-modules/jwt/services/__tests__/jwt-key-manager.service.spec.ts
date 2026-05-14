import { randomUUID } from 'crypto';

import { JwtKeyManagerException } from 'src/engine/core-modules/jwt/jwt-key-manager.exception';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';

describe('JwtKeyManagerService - revokeSigningKey', () => {
  let signingKeyRepositoryMock: {
    findOne: jest.Mock;
    findOneByOrFail: jest.Mock;
    update: jest.Mock;
    insert: jest.Mock;
    find: jest.Mock;
  };
  let coreEntityCacheServiceMock: {
    invalidate: jest.Mock;
    get: jest.Mock;
  };
  let secretEncryptionServiceMock: {
    encryptVersioned: jest.Mock;
    decryptVersioned: jest.Mock;
  };
  let service: JwtKeyManagerService;

  beforeEach(() => {
    signingKeyRepositoryMock = {
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      update: jest.fn(async () => undefined),
      insert: jest.fn(async () => undefined),
      find: jest.fn(),
    };
    coreEntityCacheServiceMock = {
      invalidate: jest.fn(async () => undefined),
      get: jest.fn(),
    };
    secretEncryptionServiceMock = {
      encryptVersioned: jest.fn(),
      decryptVersioned: jest.fn(),
    };

    service = new JwtKeyManagerService(
      signingKeyRepositoryMock as never,
      coreEntityCacheServiceMock as never,
      secretEncryptionServiceMock as never,
    );
  });

  it('revokes the current key: sets revokedAt, drops isCurrent, nulls privateKey, invalidates cache', async () => {
    const id = randomUUID();
    const current = {
      id,
      publicKey: 'pem',
      privateKey: 'enc:v2:xxx',
      isCurrent: true,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const revoked = {
      ...current,
      isCurrent: false,
      privateKey: null,
      revokedAt: new Date(),
    };

    signingKeyRepositoryMock.findOne.mockResolvedValueOnce(current);
    signingKeyRepositoryMock.findOneByOrFail.mockResolvedValueOnce(revoked);

    const result = await service.revokeSigningKey(id);

    expect(signingKeyRepositoryMock.update).toHaveBeenCalledWith(
      { id },
      expect.objectContaining({
        isCurrent: false,
        privateKey: null,
        revokedAt: expect.any(Date),
      }),
    );
    expect(coreEntityCacheServiceMock.invalidate).toHaveBeenCalledWith(
      'signingKeyPublicKey',
      id,
    );
    expect(result).toBe(revoked);
  });

  it('skips the database update when already revoked, but still invalidates the public-key cache', async () => {
    const id = randomUUID();
    const alreadyRevoked = {
      id,
      publicKey: 'pem',
      privateKey: null,
      isCurrent: false,
      revokedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    signingKeyRepositoryMock.findOne.mockResolvedValueOnce(alreadyRevoked);
    signingKeyRepositoryMock.findOneByOrFail.mockResolvedValueOnce(
      alreadyRevoked,
    );

    const result = await service.revokeSigningKey(id);

    expect(signingKeyRepositoryMock.update).not.toHaveBeenCalled();
    expect(coreEntityCacheServiceMock.invalidate).toHaveBeenCalledWith(
      'signingKeyPublicKey',
      id,
    );
    expect(result).toBe(alreadyRevoked);
  });

  it('throws when the id is not a UUID', async () => {
    await expect(service.revokeSigningKey('not-a-uuid')).rejects.toBeInstanceOf(
      JwtKeyManagerException,
    );
  });

  it('throws when the signing key does not exist', async () => {
    signingKeyRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(service.revokeSigningKey(randomUUID())).rejects.toBeInstanceOf(
      JwtKeyManagerException,
    );
  });

  it('forces the next getCurrentSigningKey to refresh from the database', async () => {
    const id = randomUUID();
    const current = {
      id,
      publicKey: 'pem',
      privateKey: 'enc:v2:xxx',
      isCurrent: true,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    signingKeyRepositoryMock.findOne.mockResolvedValue(current);
    signingKeyRepositoryMock.findOneByOrFail.mockResolvedValue({
      ...current,
      isCurrent: false,
      privateKey: null,
      revokedAt: new Date(),
    });
    secretEncryptionServiceMock.decryptVersioned.mockReturnValue('priv-pem');

    await service.getCurrentSigningKey();
    expect(signingKeyRepositoryMock.findOne).toHaveBeenCalledTimes(1);

    await service.revokeSigningKey(id);

    await service.getCurrentSigningKey();
    expect(signingKeyRepositoryMock.findOne).toHaveBeenCalledTimes(3);
  });
});
