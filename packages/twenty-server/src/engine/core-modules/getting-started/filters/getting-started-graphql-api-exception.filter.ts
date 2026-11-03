import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  GettingStartedException,
  GettingStartedExceptionCode,
} from 'src/engine/core-modules/getting-started/getting-started.exception';
import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(GettingStartedException)
export class GettingStartedGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: GettingStartedException) {
    switch (exception.code) {
      case GettingStartedExceptionCode.INVALID_STEP:
        throw new UserInputError(exception);
      case GettingStartedExceptionCode.HIDE_NOT_ALLOWED:
        throw new ForbiddenError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
