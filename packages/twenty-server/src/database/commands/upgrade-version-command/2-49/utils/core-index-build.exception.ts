import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum CoreIndexBuildExceptionCode {
  UNSUPPORTED_DATASOURCE = 'UNSUPPORTED_DATASOURCE',
}

export class CoreIndexBuildException extends CustomException<CoreIndexBuildExceptionCode> {
  constructor(message: string, code: CoreIndexBuildExceptionCode) {
    super(message, code, {
      userFriendlyMessage: msg`An unexpected error occurred.`,
    });
  }
}
