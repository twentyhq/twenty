import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

@Catch(UsageLimitException)
export class UsageLimitGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: UsageLimitException) {
    switch (exception.code) {
      case UsageLimitExceptionCode.LIMIT_RULE_INVALID:
      case UsageLimitExceptionCode.RATE_LIMITED:
        throw new UserInputError(exception);
      case UsageLimitExceptionCode.QUOTA_EXHAUSTED:
        throw new ForbiddenError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
