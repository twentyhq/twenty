/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';

import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SigningKeyRotationService } from 'src/engine/core-modules/jwt/services/signing-key-rotation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ROTATION_DAYS = 90;

describe('SigningKeyRotationService', () => {
  let service: SigningKeyRotationService;

  const getCurrentSigningKeyMetadataMock = jest.fn();
  const rotateCurrentMock = jest.fn();
  const configGetMock = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();

    configGetMock.mockImplementation((configKey: string) => {
      if (configKey === 'SIGNING_KEY_ROTATION_DAYS') return ROTATION_DAYS;

      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigningKeyRotationService,
        {
          provide: JwtKeyManagerService,
          useValue: {
            getCurrentSigningKeyMetadata: getCurrentSigningKeyMetadataMock,
            rotateCurrent: rotateCurrentMock,
          },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: configGetMock },
        },
      ],
    }).compile();

    service = module.get<SigningKeyRotationService>(SigningKeyRotationService);
  });

  it('returns rotated=false when there is no current signing key', async () => {
    getCurrentSigningKeyMetadataMock.mockResolvedValue(null);

    const result = await service.rotateIfDue();

    expect(result).toEqual({
      rotated: false,
      previousId: null,
      newId: null,
    });
    expect(rotateCurrentMock).not.toHaveBeenCalled();
  });

  it('does not rotate when the current key is younger than SIGNING_KEY_ROTATION_DAYS', async () => {
    const youngKey = {
      id: 'young-key-id',
      createdAt: new Date(Date.now() - (ROTATION_DAYS - 1) * ONE_DAY_MS),
    };

    getCurrentSigningKeyMetadataMock.mockResolvedValue(youngKey);

    const result = await service.rotateIfDue();

    expect(result).toEqual({
      rotated: false,
      previousId: youngKey.id,
      newId: null,
    });
    expect(rotateCurrentMock).not.toHaveBeenCalled();
  });

  it('rotates when the current key is older than SIGNING_KEY_ROTATION_DAYS', async () => {
    const oldKey = {
      id: 'old-key-id',
      createdAt: new Date(Date.now() - (ROTATION_DAYS + 1) * ONE_DAY_MS),
    };
    const newKey = { id: 'new-key-id', privateKeyPem: 'new-pem' };

    getCurrentSigningKeyMetadataMock.mockResolvedValue(oldKey);
    rotateCurrentMock.mockResolvedValue(newKey);

    const result = await service.rotateIfDue();

    expect(rotateCurrentMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      rotated: true,
      previousId: oldKey.id,
      newId: newKey.id,
    });
  });

  it('rotates when the current key is exactly at the SIGNING_KEY_ROTATION_DAYS boundary', async () => {
    const boundaryKey = {
      id: 'boundary-key-id',
      createdAt: new Date(Date.now() - ROTATION_DAYS * ONE_DAY_MS),
    };
    const newKey = { id: 'next-key-id', privateKeyPem: 'next-pem' };

    getCurrentSigningKeyMetadataMock.mockResolvedValue(boundaryKey);
    rotateCurrentMock.mockResolvedValue(newKey);

    const result = await service.rotateIfDue();

    expect(rotateCurrentMock).toHaveBeenCalledTimes(1);
    expect(result.rotated).toBe(true);
    expect(result.previousId).toBe(boundaryKey.id);
    expect(result.newId).toBe(newKey.id);
  });
});
