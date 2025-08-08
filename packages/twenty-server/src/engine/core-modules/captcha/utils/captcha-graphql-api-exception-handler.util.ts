import { assertUnreachable } from 'twenty-shared/utils';

import {
  type CaptchaException,
  CaptchaExceptionCode,
} from 'src/engine/core-modules/captcha/captcha.exception';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const captchaGraphqlApiExceptionHandler = (
  exception: CaptchaException,
) => {
  switch (exception.code) {
    case CaptchaExceptionCode.INVALID_CAPTCHA:
      throw new UserInputError(exception);

    default: {
      assertUnreachable(exception.code);
    }
  }
};
