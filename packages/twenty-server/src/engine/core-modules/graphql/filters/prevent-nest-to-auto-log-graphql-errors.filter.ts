import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { GraphQLError } from 'graphql';

// NestJS logs every unhandled exception; GraphQL errors are left to the GraphQL layer instead.
@Catch(GraphQLError)
export class PreventNestToAutoLogGraphqlErrorsFilter implements ExceptionFilter {
  catch(exception: GraphQLError, _host: ArgumentsHost) {
    return exception;
  }
}
