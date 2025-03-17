/* @license Enterprise */
import { BillingExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class BillingException extends CustomException {
  constructor(message: string, code: BillingExceptionCode) {
    super(message, code);
  }
}
