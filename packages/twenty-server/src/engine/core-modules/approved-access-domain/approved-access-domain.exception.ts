import { ApprovedAccessDomainExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ApprovedAccessDomainException extends CustomException {
  constructor(message: string, code: ApprovedAccessDomainExceptionCode) {
    super(message, code);
  }
}
