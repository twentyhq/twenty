import { Catch, ExceptionFilter } from '@nestjs/common';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SearchException } from 'src/engine/core-modules/search/exceptions/search.exception';

@Catch(SearchException)
export class SearchApiExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: SearchException) {
    switch (exception.code) {
      default:
        throw new InternalServerError(exception.message);
    }
  }
}
