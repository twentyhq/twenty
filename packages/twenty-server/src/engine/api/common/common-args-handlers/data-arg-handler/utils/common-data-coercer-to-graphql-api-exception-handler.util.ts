import { assertUnreachable } from 'twenty-shared/utils';

import {
  type CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const commonDataCoercerToGraphqlApiExceptionHandler = (
  error: CommonDataCoercerException,
) => {
  switch (error.code) {
    case CommonDataCoercerExceptionCode.INVALID_COMPOSITE_FIELD:
    case CommonDataCoercerExceptionCode.INVALID_NUMBER:
    case CommonDataCoercerExceptionCode.INVALID_TEXT:
    case CommonDataCoercerExceptionCode.INVALID_DATE_OR_DATE_TIME:
    case CommonDataCoercerExceptionCode.INVALID_BOOLEAN:
    case CommonDataCoercerExceptionCode.INVALID_SELECT:
    case CommonDataCoercerExceptionCode.INVALID_MULTI_SELECT:
    case CommonDataCoercerExceptionCode.INVALID_UUID:
    case CommonDataCoercerExceptionCode.INVALID_ARRAY:
    case CommonDataCoercerExceptionCode.INVALID_RAW_JSON:
      throw new UserInputError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
