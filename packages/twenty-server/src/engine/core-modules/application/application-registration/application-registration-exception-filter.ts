import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(ApplicationRegistrationException)
export class ApplicationRegistrationExceptionFilter implements ExceptionFilter {
  catch(exception: ApplicationRegistrationException) {
    switch (exception.code) {
      case ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      case ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception);
      case ApplicationRegistrationExceptionCode.INVALID_INPUT:
      case ApplicationRegistrationExceptionCode.INVALID_SCOPE:
      case ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI:
      case ApplicationRegistrationExceptionCode.SOURCE_CHANNEL_MISMATCH:
      case ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED:
        throw new UserInputError(exception);
      default:
        throw new InternalServerError(exception);
    }
  }
}
