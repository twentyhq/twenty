import { CustomException } from 'src/utils/custom-exception';

export class FlatEntityMapsException extends CustomException {
  code: FlatEntityMapsExceptionCode;

  constructor(message: string, code: FlatEntityMapsExceptionCode) {
    super(message, code);
  }
}

export enum FlatEntityMapsExceptionCode {
  ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
}
