import { ThrottlerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ThrottlerException extends CustomException {
  constructor(message: string, code: ThrottlerExceptionCode) {
    super(message, code);
  }
}
