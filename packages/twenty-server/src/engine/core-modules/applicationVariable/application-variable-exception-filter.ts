import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/applicationVariable/application-variable.exception';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationVariableEntityException)
export class ApplicationVariableEntityExceptionFilter
  implements ExceptionFilter
{
  catch(exception: ApplicationVariableEntityException) {
    switch (exception.code) {
      case ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
