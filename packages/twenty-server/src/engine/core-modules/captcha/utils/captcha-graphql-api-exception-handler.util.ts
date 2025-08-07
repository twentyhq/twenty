import {
    CaptchaException,
    CaptchaExceptionCode,
} from 'src/engine/core-modules/captcha/captcha.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { assertUnreachable } from 'twenty-shared/utils';

export const captchaGraphqlApiExceptionHandler = (
  exception: CaptchaException,
) => {
  switch (exception.code) {
    case CaptchaExceptionCode.INVALID_CAPTCHA:
      throw new UserInputError(exception);

    default:
      return assertUnreachable(exception.code);
  }
};
