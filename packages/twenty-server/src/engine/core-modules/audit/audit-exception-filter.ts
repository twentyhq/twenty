import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  AuditException,
  AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(AuditException)
export class AuditExceptionFilter implements ExceptionFilter {
  catch(exception: AuditException) {
    switch (exception.code) {
      case AuditExceptionCode.INVALID_TYPE:
      case AuditExceptionCode.INVALID_INPUT:
        throw new UserInputError(exception);
      default: {
        const _exhaustiveCheck: never = exception.code;

        throw exception;
      }
    }
  }
}
