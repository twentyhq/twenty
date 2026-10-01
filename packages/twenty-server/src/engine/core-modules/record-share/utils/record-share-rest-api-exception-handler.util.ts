/* @license Enterprise */

import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  type RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/core-modules/record-share/record-share.exception';

export const recordShareRestApiExceptionHandler = (
  error: RecordShareException,
): never => {
  switch (error.code) {
    case RecordShareExceptionCode.INVALID_SHARE_WITH:
      throw new BadRequestException(error.message);
    case RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH:
      throw new InternalServerErrorException(error.message);
    case RecordShareExceptionCode.OBJECT_NOT_FOUND:
      throw new NotFoundException(error.message);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
