import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  SearchException,
  SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';

@Catch(SearchException)
export class SearchApiExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: SearchException) {
    switch (exception.code) {
      case SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND:
        throw exception;
      default: {
        const _exhaustiveCheck: never = exception.code;

        throw exception;
      }
    }
  }
}
