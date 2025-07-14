import { Injectable } from '@nestjs/common';

import { createDecipheriv, Decipher, createCipheriv, Cipher } from 'crypto';

import { IKeyWrappingStrategy } from 'src/engine/core-modules/encryption/keys/wrapping/strategies/interface/key-wrapping-strategy.interface';
import {
  EncryptionException,
  EncryptionExceptionCode,
} from 'src/engine/core-modules/encryption/encryption.exception';
import { KeyWrappingStrategy } from 'src/engine/core-modules/encryption/keys/wrapping/enums/key-wrapping-strategies.enum';
import { kekValidator } from 'src/engine/core-modules/encryption/keys/validates/key.validate';

@Injectable()
export class Aes256KeyWrapStrategy implements IKeyWrappingStrategy {
  private readonly KEK_LENGTH = 32;
  private readonly DEFAULT_IV = Buffer.from('A6A6A6A6A6A6A6A6', 'hex');
  readonly name = KeyWrappingStrategy.AES_256_KEY_WRAP;

  async wrap(
    dataEncryptionKey: Buffer,
    keyEncryptionKey: Buffer,
  ): Promise<Buffer> {
    kekValidator.assertKek(keyEncryptionKey, [this.KEK_LENGTH]);

    if (dataEncryptionKey.length % 8 !== 0) {
      throw new EncryptionException(
        `Invalid Data Encryption Key length. Length must be a multiple of 8 bytes (64 bits) for ${this.name}.`,
        EncryptionExceptionCode.DATA_ENCRYPTION_KEY_LENGTH_INVALID,
      );
    }

    const cipher: Cipher = createCipheriv(
      this.name,
      keyEncryptionKey,
      this.DEFAULT_IV,
    );

    const encryptedDataEncryptionKey = Buffer.concat([
      cipher.update(dataEncryptionKey),
      cipher.final(),
    ]);

    return encryptedDataEncryptionKey;
  }

  async unwrap(
    encryptedDataEncryptionKey: Buffer,
    keyEncryptionKey: Buffer,
  ): Promise<Buffer> {
    kekValidator.assertKek(keyEncryptionKey, [this.KEK_LENGTH]);

    const decipher: Decipher = createDecipheriv(
      this.name,
      keyEncryptionKey,
      this.DEFAULT_IV,
    );

    try {
      const plaintextKey = Buffer.concat([
        decipher.update(encryptedDataEncryptionKey),
        decipher.final(),
      ]);

      return plaintextKey;
    } catch (error) {
      throw new EncryptionException(
        `Failed to unwrap key ${this.name}: integrity check failed.`,
        EncryptionExceptionCode.KEY_UNWRAPPING_FAILED,
      );
    }
  }
}
