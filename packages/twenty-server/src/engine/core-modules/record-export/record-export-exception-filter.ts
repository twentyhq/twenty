import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  InternalServerError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RecordExportException } from 'src/engine/core-modules/record-export/record-export.exception';

@Catch(RecordExportException)
export class RecordExportExceptionFilter implements ExceptionFilter {
  catch(exception: RecordExportException) {
    switch (exception.code) {
      case 'MORPH_TARGET_NOT_FOUND':
        throw new ValidationError(exception.message, {
          subCode: exception.code,
          userFriendlyMessage: exception.userFriendlyMessage,
        });
      case 'QUEUE_UNAVAILABLE':
      case 'DURATION_LIMIT_EXCEEDED':
      case 'FILE_SIZE_LIMIT_EXCEEDED':
      case 'CONNECTION_CLOSED':
      case 'PAGINATION_FAILED':
      case 'RECORD_COUNT_UNAVAILABLE':
        throw new InternalServerError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
