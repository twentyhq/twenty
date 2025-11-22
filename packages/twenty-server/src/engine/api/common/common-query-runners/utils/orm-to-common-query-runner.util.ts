import { assertUnreachable } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  type TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const ormToCommonQueryRunnerException = (
  error: TwentyORMException,
): never => {
  switch (error.code) {
    case TwentyORMExceptionCode.METADATA_VERSION_MISMATCH:
    case TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED:
    case TwentyORMExceptionCode.INVALID_INPUT:
    case TwentyORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
      throw new CommonQueryRunnerException(
        error.message,
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    case TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND:
    case TwentyORMExceptionCode.FEATURE_FLAG_MAP_VERSION_NOT_FOUND:
    case TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND:
    case TwentyORMExceptionCode.API_KEY_ROLE_MAP_VERSION_NOT_FOUND:
    case TwentyORMExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND:
    case TwentyORMExceptionCode.MALFORMED_METADATA:
    case TwentyORMExceptionCode.MISSING_MAIN_ALIAS_TARGET:
    case TwentyORMExceptionCode.QUERY_READ_TIMEOUT:
    case TwentyORMExceptionCode.METHOD_NOT_ALLOWED:
    case TwentyORMExceptionCode.ENUM_TYPE_NAME_NOT_FOUND:
    case TwentyORMExceptionCode.WORKSPACE_NOT_FOUND:
    case TwentyORMExceptionCode.ORM_EVENT_DATA_CORRUPTED:
      throw new CommonQueryRunnerException(
        error.message,
        CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    case TwentyORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
      throw new CommonQueryRunnerException(
        error.message,
        CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    case TwentyORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
      throw new CommonQueryRunnerException(
        error.message,
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    case TwentyORMExceptionCode.CONNECT_NOT_ALLOWED:
      throw new CommonQueryRunnerException(
        error.message,
        CommonQueryRunnerExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: error.userFriendlyMessage,
        },
      );
    default: {
      return assertUnreachable(error.code);
    }
  }
};
