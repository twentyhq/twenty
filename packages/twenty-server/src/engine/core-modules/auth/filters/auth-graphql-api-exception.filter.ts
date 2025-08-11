import { Catch, type ExceptionFilter } from '@nestjs/common';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { authGraphqlApiExceptionHandler } from 'src/engine/core-modules/auth/utils/auth-graphql-api-exception-handler.util';

@Catch(AuthException)
export class AuthGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException) {
    return authGraphqlApiExceptionHandler(exception);
  }
}
