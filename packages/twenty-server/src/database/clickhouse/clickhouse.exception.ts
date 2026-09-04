import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ClickHouseExceptionCode {
  CLIENT_NOT_AVAILABLE = 'CLIENT_NOT_AVAILABLE',
}

export class ClickHouseException extends CustomException<ClickHouseExceptionCode> {
  constructor(message: string, code: ClickHouseExceptionCode) {
    super(message, code, {
      userFriendlyMessage: msg`An unexpected error occurred.`,
    });
  }
}
