import { isDefined } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';
import {
  EncryptionException,
  EncryptionExceptionCode,
} from 'src/engine/core-modules/encryption/encryption.exception';

export class KeyException extends CustomException {}

const assertKek = (
  key: Buffer | undefined | null,
  sizes: Array<number>,
  exceptionToThrow: CustomException = new EncryptionException(
    `Invalid KEK size. Must be one of ${sizes.join(', ')} bytes.`,
    EncryptionExceptionCode.KEY_ENCRYPTION_KEY_LENGTH_INVALID,
  ),
): asserts key is Buffer => {
  if (!isDefined(key) || !Buffer.isBuffer(key) || !sizes.includes(key.length)) {
    throw exceptionToThrow;
  }
};

export const kekValidator: {
  assertKek: typeof assertKek;
} = {
  assertKek,
};
