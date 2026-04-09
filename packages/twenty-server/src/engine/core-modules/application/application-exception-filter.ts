import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  ForbiddenError,
  InternalServerError,
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
      case ApplicationExceptionCode.APP_NOT_INSTALLED:
      case ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      case ApplicationExceptionCode.FRONT_COMPONENT_NOT_FOUND:
        throw new NotFoundError(exception);
      case ApplicationExceptionCode.FORBIDDEN:
        throw new ForbiddenError(exception);
      case ApplicationExceptionCode.INVALID_INPUT:
      case ApplicationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      case ApplicationExceptionCode.APP_ALREADY_INSTALLED:
      case ApplicationExceptionCode.CANNOT_DOWNGRADE_APPLICATION:
        throw new UserInputError(exception);
      case ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED:
      case ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED:
      case ApplicationExceptionCode.UPGRADE_FAILED:
        throw new InternalServerError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
