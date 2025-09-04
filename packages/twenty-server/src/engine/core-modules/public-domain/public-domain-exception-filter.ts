import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(PublicDomainException)
export class PublicDomainExceptionFilter implements ExceptionFilter {
  catch(exception: PublicDomainException) {
    switch (exception.code) {
      case PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED:
        throw new ForbiddenError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
