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
import { usageLimitToGraphqlApiExceptionHandler } from 'src/engine/core-modules/usage-limit/utils/usage-limit-to-graphql-api-exception-handler.util';

@Catch(UsageLimitException)
export class UsageLimitGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: UsageLimitException) {
    switch (exception.code) {
      case UsageLimitExceptionCode.LIMIT_INVALID:
        throw new UserInputError(exception);
      case UsageLimitExceptionCode.LIMIT_NOT_ENTITLED:
        throw new ForbiddenError(exception);
      case UsageLimitExceptionCode.RATE_LIMITED:
      case UsageLimitExceptionCode.QUOTA_EXHAUSTED:
        return usageLimitToGraphqlApiExceptionHandler(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
