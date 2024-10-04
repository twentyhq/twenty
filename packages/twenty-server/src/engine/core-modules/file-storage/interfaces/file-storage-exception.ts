import { CustomException } from 'src/utils/custom-exception';

export class FileStorageException extends CustomException {
  code: FileStorageExceptionCode;
  constructor(message: string, code: FileStorageExceptionCode) {
    super(message, code);
  }
}

export enum FileStorageExceptionCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}
