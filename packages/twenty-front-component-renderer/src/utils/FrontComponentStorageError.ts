import { CustomError } from 'twenty-shared/utils';
import { type FrontComponentStorageErrorCode } from 'twenty-sdk/front-component';

export class FrontComponentStorageError extends CustomError {
  constructor(message: string, code: FrontComponentStorageErrorCode) {
    super(message, code);
    this.name = 'FrontComponentStorageError';
  }
}
