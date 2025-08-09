import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

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
        assertUnreachable(exception.code);
      }
    }
  }
}
