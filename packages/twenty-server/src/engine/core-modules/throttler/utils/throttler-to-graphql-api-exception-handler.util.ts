import { assertUnreachable } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';

export const throttlerToGraphqlApiExceptionHandler = (
  error: ThrottlerException,
) => {
  switch (error.code) {
    case ThrottlerExceptionCode.LIMIT_REACHED:
      throw new UserInputError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
