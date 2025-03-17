import { EmailVerificationExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class EmailVerificationException extends CustomException {
  constructor(message: string, code: EmailVerificationExceptionCode) {
    super(message, code);
  }
}
