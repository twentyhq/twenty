import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { ConflictError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EmailingDomainException)
export class EmailingDomainGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: EmailingDomainException) {
    switch (exception.code) {
      case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
        throw new ConflictError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
