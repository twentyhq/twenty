import { CustomException } from 'src/utils/custom-exception';

export class SearchException extends CustomException {
  constructor(message: string, code: SearchExceptionCode) {
    super(message, code);
  }
}

export enum SearchExceptionCode {
  METADATA_CACHE_VERSION_NOT_FOUND = 'METADATA_CACHE_VERSION_NOT_FOUND',
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
  OBJECT_METADATA_MAP_NOT_FOUND = 'OBJECT_METADATA_MAP_NOT_FOUND',
}
