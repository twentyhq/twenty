import { FileStorageExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class FileStorageException extends CustomException {
  constructor(message: string, code: FileStorageExceptionCode) {
    super(message, code);
  }
}
