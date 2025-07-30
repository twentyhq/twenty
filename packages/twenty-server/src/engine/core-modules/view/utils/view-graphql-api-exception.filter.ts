import { Catch, ExceptionFilter } from '@nestjs/common';

import { ViewFieldException } from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { ViewFilterGroupException } from 'src/engine/core-modules/view/exceptions/view-filter-group.exception';
import { ViewFilterException } from 'src/engine/core-modules/view/exceptions/view-filter.exception';
import { ViewGroupException } from 'src/engine/core-modules/view/exceptions/view-group.exception';
import { ViewSortException } from 'src/engine/core-modules/view/exceptions/view-sort.exception';
import { ViewException } from 'src/engine/core-modules/view/exceptions/view.exception';
import { viewGraphqlApiExceptionHandler } from 'src/engine/core-modules/view/utils/view-graphql-api-exception-handler.util';

@Catch(
  ViewException,
  ViewFieldException,
  ViewFilterException,
  ViewFilterGroupException,
  ViewGroupException,
  ViewSortException,
)
export class ViewGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ViewException
      | ViewFieldException
      | ViewFilterException
      | ViewFilterGroupException
      | ViewGroupException
      | ViewSortException,
  ) {
    return viewGraphqlApiExceptionHandler(exception);
  }
}
