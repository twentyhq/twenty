/* @license Enterprise */

import { Catch, type ExceptionFilter } from '@nestjs/common';

import { SsoException } from 'src/engine/core-modules/sso/sso.exception';
import { ssoGraphqlApiExceptionHandler } from 'src/engine/core-modules/sso/utils/sso-graphql-api-exception-handler.util';

@Catch(SsoException)
export class SsoGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: SsoException) {
    return ssoGraphqlApiExceptionHandler(exception);
  }
}
