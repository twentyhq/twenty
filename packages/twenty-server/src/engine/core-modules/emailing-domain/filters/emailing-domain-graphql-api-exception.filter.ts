import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EmailingDomainException)
export class EmailingDomainGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: EmailingDomainException) {
    switch (exception.code) {
      case EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED:
        throw new ConflictError(exception);
      case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND:
        throw new NotFoundError(exception);
      case EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE:
        throw new ForbiddenError(exception);
      case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND:
        throw new NotFoundError(exception);
      case EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE:
      case EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED:
        throw new UserInputError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
