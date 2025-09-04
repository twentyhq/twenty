import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { PageLayoutException } from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { pageLayoutGraphqlApiExceptionHandler } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception-handler.util';

@Catch(PageLayoutException)
export class PageLayoutGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(exception: PageLayoutException, _host: ArgumentsHost) {
    return pageLayoutGraphqlApiExceptionHandler(exception);
  }
}
