import { assertUnreachable } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';

export const recordTransformerGraphqlApiExceptionHandler = (
  error: RecordTransformerException,
) => {
  switch (error.code) {
    case RecordTransformerExceptionCode.INVALID_URL:
      throw new UserInputError(error.message);
    default: {
      assertUnreachable(error.code);
    }
  }
};
