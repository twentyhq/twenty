import { UserExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class UserException extends CustomException {
  constructor(message: string, code: UserExceptionCode) {
    super(message, code);
  }
}
