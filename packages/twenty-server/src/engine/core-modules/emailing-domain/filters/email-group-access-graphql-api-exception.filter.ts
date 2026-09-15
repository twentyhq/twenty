/* @license Enterprise */

import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  EmailGroupAccessException,
  EmailGroupAccessExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/email-group-access.exception';
import {
  ForbiddenError,
  InternalServerError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EmailGroupAccessException)
export class EmailGroupAccessGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: EmailGroupAccessException) {
    switch (exception.code) {
      case EmailGroupAccessExceptionCode.EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED:
        throw new ForbiddenError(exception);
      case EmailGroupAccessExceptionCode.INTERNAL_SERVER_ERROR:
        throw new InternalServerError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
