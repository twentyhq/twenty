import { assertUnreachable } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';

export const recordTransformerGraphqlApiExceptionHandler = (
  error: RecordTransformerException,
) => {
  switch (error.code) {
    case RecordTransformerExceptionCode.INVALID_PHONE_NUMBER:
    case RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE:
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE:
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE:
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE:
    case RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE:
    case RecordTransformerExceptionCode.INVALID_URL:
      throw new UserInputError(error);
    default: {
      assertUnreachable(error.code);
    }
  }
};
