import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationVariableException,
  ApplicationVariableExceptionCode,
} from 'src/engine/core-modules/applicationVariable/application-variable.exception';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationVariableException)
export class ApplicationVariableExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationVariableException) {
    switch (exception.code) {
      case ApplicationVariableExceptionCode.APPLICATION_VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
