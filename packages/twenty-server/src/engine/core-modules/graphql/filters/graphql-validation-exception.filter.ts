import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(UserInputError)
export class GraphqlValidationExceptionFilter implements ExceptionFilter {
  catch(exception: UserInputError, _host: ArgumentsHost) {
    return new UserInputError(exception.message);
  }
}
