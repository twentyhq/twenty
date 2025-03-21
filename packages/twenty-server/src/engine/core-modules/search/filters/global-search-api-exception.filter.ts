import { Catch, ExceptionFilter } from '@nestjs/common';

import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { GlobalSearchException } from 'src/engine/core-modules/search/exceptions/global-search.exception';

@Catch(GlobalSearchException)
export class GlobalSearchApiExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: GlobalSearchException) {
    switch (exception.code) {
      default:
        throw new InternalServerError(exception.message);
    }
  }
}
