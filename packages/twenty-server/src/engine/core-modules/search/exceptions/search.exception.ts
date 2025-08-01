import { CustomException } from 'src/utils/custom-exception';

export class SearchException extends CustomException<SearchExceptionCode> {}

export enum SearchExceptionCode {
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
}
