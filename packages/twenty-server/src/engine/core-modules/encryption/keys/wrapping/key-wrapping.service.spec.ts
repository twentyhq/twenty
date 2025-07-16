import { Test, TestingModule } from '@nestjs/testing';

import { randomBytes } from 'crypto';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { KeyWrappingStrategyInterface } from 'src/engine/core-modules/encryption/keys/wrapping/strategies/interface/key-wrapping-strategy.interface';
import { KEY_WRAPPING_STRATEGY } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.constants';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

import { KeyWrappingService } from './key-wrapping.service';

const mockJwtWrapperService = {
  generateAppSecret: jest.fn(),
};

const mockWrappingStrategy: KeyWrappingStrategyInterface = {
  wrap: jest.fn(),
  unwrap: jest.fn(),
};

describe('KeyWrappingService', () => {
  let service: KeyWrappingService;
  const keyEncryptionKeyHex = randomBytes(32).toString('hex');
  const purpose = 'test-purpose';
  const keyToWrap = randomBytes(32);
  const wrappedKeyBuffer = randomBytes(40);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyWrappingService,
        {
          provide: JwtWrapperService,
          useValue: mockJwtWrapperService,
        },
        {
          provide: KEY_WRAPPING_STRATEGY,
          useValue: mockWrappingStrategy,
        },
      ],
    }).compile();

    service = module.get<KeyWrappingService>(KeyWrappingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('wrapKey', () => {
    it('should wrap a key successfully', async () => {
      mockJwtWrapperService.generateAppSecret.mockReturnValue(
        keyEncryptionKeyHex,
      );
      (mockWrappingStrategy.wrap as any).mockResolvedValue(wrappedKeyBuffer);

      const result = await service.wrapKey(keyToWrap, purpose);

      expect(mockJwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
        purpose,
      );
      expect(mockJwtWrapperService.generateAppSecret).toHaveBeenCalledTimes(1);

      expect(mockWrappingStrategy.wrap).toHaveBeenCalledWith(
        keyToWrap,
        Buffer.from(keyEncryptionKeyHex, 'hex'),
      );
      expect(mockWrappingStrategy.wrap).toHaveBeenCalledTimes(1);

      expect(result).toEqual({ wrappedKey: wrappedKeyBuffer.toString('hex') });
    });
  });

  describe('unwrapKey', () => {
    it('should unwrap a key successfully', async () => {
      const wrappedKey = randomBytes(40);
      const purpose = 'test-purpose';
      const keyEncryptionKeyHex = randomBytes(32).toString('hex');
      const plaintextKeyBuffer = randomBytes(32);

      mockJwtWrapperService.generateAppSecret.mockReturnValue(
        keyEncryptionKeyHex,
      );
      (mockWrappingStrategy.unwrap as any).mockResolvedValue(
        plaintextKeyBuffer,
      );

      const result = await service.unwrapKey(wrappedKey, purpose);

      expect(mockJwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
        purpose,
      );
      expect(mockJwtWrapperService.generateAppSecret).toHaveBeenCalledTimes(1);

      expect(mockWrappingStrategy.unwrap).toHaveBeenCalledWith(
        wrappedKey,
        Buffer.from(keyEncryptionKeyHex, 'hex'),
      );
      expect(mockWrappingStrategy.unwrap).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        unwrappedKey: plaintextKeyBuffer.toString('hex'),
      });
    });
  });
});
