import { CustomException } from 'src/utils/custom-exception';

export enum FileExceptionCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

export class FileException extends CustomException {
  code: FileExceptionCode;
  constructor(message: string, code: FileExceptionCode) {
    super(message, code);
  }
}
