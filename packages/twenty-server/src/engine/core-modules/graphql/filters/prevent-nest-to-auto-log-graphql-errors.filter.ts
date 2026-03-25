import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';

import { GraphQLError } from 'graphql';

/**
 * In NestJS, if an exception is not handled, it will shown in the logs
 * This filter is used to prevent NestJS from auto-logging GraphQL errors
 * and leave it to the GraphQL layer to handle the error.
 */
@Catch(GraphQLError)
export class PreventNestToAutoLogGraphqlErrorsFilter
  implements ExceptionFilter
{
  catch(exception: GraphQLError, _host: ArgumentsHost) {
    return exception;
  }
}
