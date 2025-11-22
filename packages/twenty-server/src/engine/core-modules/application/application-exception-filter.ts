import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationException) {
    switch (exception.code) {
      case ApplicationExceptionCode.OBJECT_NOT_FOUND:
      case ApplicationExceptionCode.FIELD_NOT_FOUND:
      case ApplicationExceptionCode.ENTITY_NOT_FOUND:
      case ApplicationExceptionCode.APPLICATION_NOT_FOUND:
      case ApplicationExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
        throw new NotFoundError(exception);
      case ApplicationExceptionCode.FORBIDDEN:
        throw new UserInputError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
