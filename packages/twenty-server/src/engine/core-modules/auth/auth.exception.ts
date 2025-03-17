import { AuthExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class AuthException extends CustomException {
  constructor(message: string, code: AuthExceptionCode) {
    super(message, code);
  }
}
