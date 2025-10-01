import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(PublicDomainException)
export class PublicDomainExceptionFilter implements ExceptionFilter {
  catch(exception: PublicDomainException) {
    switch (exception.code) {
      case PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED:
      case PublicDomainExceptionCode.DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN:
        throw new UserInputError(exception);
      case PublicDomainExceptionCode.PUBLIC_DOMAIN_NOT_FOUND:
        throw new NotFoundError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
