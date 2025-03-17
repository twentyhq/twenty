import { FileExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class FileException extends CustomException {
  constructor(message: string, code: FileExceptionCode) {
    super(message, code);
  }
}
