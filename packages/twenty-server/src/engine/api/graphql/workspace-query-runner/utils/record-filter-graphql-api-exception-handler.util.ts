import { assertUnreachable } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RecordFilterException,
  RecordFilterExceptionCode,
} from 'src/engine/record-filter/exceptions/record-filter.exception';

export const recordFilterGraphqlApiExceptionHandler = (
  error: RecordFilterException,
) => {
  switch (error.code) {
    case RecordFilterExceptionCode.INVALID_QUERY_INPUT:
    case RecordFilterExceptionCode.UNSUPPORTED_OPERATOR:
      throw new UserInputError(error);
    default:
      return assertUnreachable(error.code);
  }
};
