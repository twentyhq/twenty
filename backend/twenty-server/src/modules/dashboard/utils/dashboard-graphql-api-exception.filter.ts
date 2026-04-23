import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { DashboardException } from 'src/modules/dashboard/exceptions/dashboard.exception';
import { dashboardGraphqlApiExceptionHandler } from 'src/modules/dashboard/utils/dashboard-graphql-api-exception-handler.util';

@Catch(DashboardException)
export class DashboardGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(exception: DashboardException, _host: ArgumentsHost) {
    return dashboardGraphqlApiExceptionHandler(exception);
  }
}
