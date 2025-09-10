import { CustomException } from 'src/utils/custom-exception';

export class FlatEntityException extends CustomException {
  code: FlatEntityExceptionCode;

  constructor(message: string, code: FlatEntityExceptionCode) {
    super(message, code);
  }
}

export enum FlatEntityExceptionCode {
  ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
}
