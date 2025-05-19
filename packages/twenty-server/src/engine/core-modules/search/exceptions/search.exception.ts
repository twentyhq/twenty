import { CustomException } from 'src/utils/custom-exception';

export class SearchException extends CustomException {
  declare code: SearchExceptionCode;
  constructor(message: string, code: SearchExceptionCode) {
    super(message, code);
  }
}

export enum SearchExceptionCode {
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
}
