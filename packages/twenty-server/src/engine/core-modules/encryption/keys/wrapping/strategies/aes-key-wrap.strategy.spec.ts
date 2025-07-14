import { Test, TestingModule } from '@nestjs/testing';

import { randomBytes } from 'crypto';

import {
  EncryptionException,
  EncryptionExceptionCode,
} from 'src/engine/core-modules/encryption/encryption.exception';
import { kekValidator } from 'src/engine/core-modules/encryption/keys/validates/key.validate';

import { Aes256KeyWrapStrategy } from './aes-key-wrap.strategy';

jest.mock(
  'src/engine/core-modules/encryption/keys/validates/key.validate',
  () => ({
    kekValidator: {
      assertKek: jest.fn(),
    },
  }),
);

describe('Aes256KeyWrapStrategy', () => {
  let strategy: Aes256KeyWrapStrategy;
  let keyEncryptionKey: Buffer;
  let dataEncryptionKey: Buffer;

  beforeEach(async () => {
    (kekValidator.assertKek as jest.Mock).mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [Aes256KeyWrapStrategy],
    }).compile();

    strategy = module.get<Aes256KeyWrapStrategy>(Aes256KeyWrapStrategy);

    keyEncryptionKey = randomBytes(32);
    dataEncryptionKey = randomBytes(32);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('unwrap', () => {
    it('should successfully unwrap a key and match the original', async () => {
      const wrappedKey = await strategy.wrap(
        dataEncryptionKey,
        keyEncryptionKey,
      );
      const unwrappedKey = await strategy.unwrap(wrappedKey, keyEncryptionKey);

      expect(unwrappedKey).toBeInstanceOf(Buffer);
      expect(unwrappedKey).toEqual(dataEncryptionKey);
      expect(kekValidator.assertKek).toHaveBeenCalledTimes(2);
    });

    it('should throw an EncryptionException when unwrapping with the wrong KEK', async () => {
      const wrappedKey = await strategy.wrap(
        dataEncryptionKey,
        keyEncryptionKey,
      );
      const wrongKek = randomBytes(32);
      const expectedError = new EncryptionException(
        `Failed to unwrap key ${strategy.name}: integrity check failed.`,
        EncryptionExceptionCode.KEY_UNWRAPPING_FAILED,
      );

      await expect(strategy.unwrap(wrappedKey, wrongKek)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('wrap', () => {
    it('should successfully wrap a valid data encryption key', async () => {
      const wrappedKey = await strategy.wrap(
        dataEncryptionKey,
        keyEncryptionKey,
      );

      expect(wrappedKey).toBeInstanceOf(Buffer);
      expect(wrappedKey).not.toEqual(dataEncryptionKey);
      expect(kekValidator.assertKek).toHaveBeenCalledWith(keyEncryptionKey, [
        32,
      ]);
    });

    it('should throw EncryptionException if DEK length is not a multiple of 8', async () => {
      const invalidDek = randomBytes(31);
      const expectedError = new EncryptionException(
        `Invalid Data Encryption Key length. Length must be a multiple of 8 bytes (64 bits) for ${strategy.name}.`,
        EncryptionExceptionCode.DATA_ENCRYPTION_KEY_LENGTH_INVALID,
      );

      await expect(strategy.wrap(invalidDek, keyEncryptionKey)).rejects.toThrow(
        expectedError,
      );
    });

    it('should re-throw the exception from the KEK validator', async () => {
      const validationError = new EncryptionException(
        'KEK validation failed',
        EncryptionExceptionCode.INVALID_INPUT,
      );

      (kekValidator.assertKek as jest.Mock).mockImplementation(() => {
        throw validationError;
      });

      await expect(
        strategy.wrap(dataEncryptionKey, keyEncryptionKey),
      ).rejects.toThrow(validationError);
    });
  });
});
