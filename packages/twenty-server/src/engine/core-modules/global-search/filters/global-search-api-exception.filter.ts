import { Catch, ExceptionFilter } from '@nestjs/common';

import { GlobalSearchException } from 'src/engine/core-modules/global-search/exceptions/global-search.exception';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

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
