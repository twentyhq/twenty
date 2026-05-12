import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationVariableEntityException)
export class ApplicationVariableEntityExceptionFilter
  implements ExceptionFilter
{
  catch(exception: ApplicationVariableEntityException) {
    switch (exception.code) {
      case ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception);
      case ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT:
        throw new UserInputError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
