import { CustomException } from 'src/utils/custom-exception';

export class GlobalSearchException extends CustomException {
  constructor(message: string, code: GlobalSearchExceptionCode) {
    super(message, code);
  }
}

export enum GlobalSearchExceptionCode {
  METADATA_CACHE_VERSION_NOT_FOUND = 'METADATA_CACHE_VERSION_NOT_FOUND',
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
  OBJECT_METADATA_MAP_NOT_FOUND = 'OBJECT_METADATA_MAP_NOT_FOUND',
}
