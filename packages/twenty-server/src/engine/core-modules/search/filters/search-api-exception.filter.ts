import { Catch, ExceptionFilter } from '@nestjs/common';

import { SearchException } from 'src/engine/core-modules/search/exceptions/search.exception';
import { CustomException } from 'src/utils/custom-exception';

@Catch(SearchException)
export class SearchApiExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: SearchException) {
    switch (exception.code) {
      default:
        throw new CustomException(exception.message, exception.code);
    }
  }
}
