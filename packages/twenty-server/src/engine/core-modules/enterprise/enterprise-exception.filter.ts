/* @license Enterprise */

import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(EnterpriseException)
export class EnterpriseExceptionFilter implements ExceptionFilter {
  catch(exception: EnterpriseException) {
    switch (exception.code) {
      case EnterpriseExceptionCode.INVALID_ENTERPRISE_KEY:
      case EnterpriseExceptionCode.CONFIG_VARIABLES_IN_DB_DISABLED:
        throw new UserInputError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
