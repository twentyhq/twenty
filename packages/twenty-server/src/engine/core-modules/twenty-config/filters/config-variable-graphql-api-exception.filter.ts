import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';

@Catch(ConfigVariableException)
export class ConfigVariableGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: ConfigVariableException) {
    switch (exception.code) {
      case ConfigVariableExceptionCode.VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception.message);
      case ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE:
        throw new ForbiddenError(exception.message);
      case ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED:
        throw new UserInputError(exception.message);
      case ConfigVariableExceptionCode.INTERNAL_ERROR:
      default:
        throw new InternalServerError(exception.message);
    }
  }
}
