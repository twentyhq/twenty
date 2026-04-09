import { Catch, type ExceptionFilter } from '@nestjs/common';

import { CaptchaException } from 'src/engine/core-modules/captcha/captcha.exception';
import { captchaGraphqlApiExceptionHandler } from 'src/engine/core-modules/captcha/utils/captcha-graphql-api-exception-handler.util';

@Catch(CaptchaException)
export class CaptchaGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: CaptchaException) {
    return captchaGraphqlApiExceptionHandler(exception);
  }
}
