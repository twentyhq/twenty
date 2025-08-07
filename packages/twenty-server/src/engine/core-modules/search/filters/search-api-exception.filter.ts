import { Catch, ExceptionFilter } from '@nestjs/common';

import {
    SearchException,
    SearchExceptionCode,
} from 'src/engine/core-modules/search/exceptions/search.exception';
import { assertUnreachable } from 'twenty-shared/utils';

@Catch(SearchException)
export class SearchApiExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: SearchException) {
    switch (exception.code) {
      case SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND:
        throw exception;
      default:
        return assertUnreachable(exception.code);
    }
  }
}
