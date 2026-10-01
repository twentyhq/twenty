/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';

export const recordShareGraphqlApiExceptionHandler = (
  error: RecordShareException,
) => {
  switch (error.code) {
    case RecordShareExceptionCode.INVALID_SHARE_WITH:
      throw new UserInputError(error);
    case RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH:
      throw new InternalServerError(error);
    case RecordShareExceptionCode.OBJECT_NOT_FOUND:
      throw new NotFoundError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
