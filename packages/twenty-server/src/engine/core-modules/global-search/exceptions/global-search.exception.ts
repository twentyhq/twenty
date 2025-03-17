import { GlobalSearchExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class GlobalSearchException extends CustomException {
  constructor(message: string, code: GlobalSearchExceptionCode) {
    super(message, code);
  }
}
