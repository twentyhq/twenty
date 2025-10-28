import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { PageLayoutTabException } from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import { PageLayoutWidgetException } from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutException } from 'src/engine/core-modules/page-layout/exceptions/page-layout.exception';
import { pageLayoutGraphqlApiExceptionHandler } from 'src/engine/core-modules/page-layout/utils/page-layout-graphql-api-exception-handler.util';

@Catch(PageLayoutException, PageLayoutTabException, PageLayoutWidgetException)
export class PageLayoutGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(
    exception:
      | PageLayoutException
      | PageLayoutTabException
      | PageLayoutWidgetException,
    _host: ArgumentsHost,
  ) {
    return pageLayoutGraphqlApiExceptionHandler(exception);
  }
}
