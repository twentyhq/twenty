/* @license Enterprise */
import { SSOExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class SSOException extends CustomException {
  constructor(message: string, code: SSOExceptionCode) {
    super(message, code);
  }
}
