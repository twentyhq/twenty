import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum AuditExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}

const getAuditExceptionUserFriendlyMessage = (code: AuditExceptionCode) => {
  switch (code) {
    case AuditExceptionCode.INVALID_TYPE:
      return msg`Invalid audit type.`;
    case AuditExceptionCode.INVALID_INPUT:
      return msg`Invalid audit input.`;
    default:
      assertUnreachable(code);
  }
};

export class AuditException extends CustomException<AuditExceptionCode> {
  constructor(
    message: string,
    code: AuditExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAuditExceptionUserFriendlyMessage(code),
    });
  }
}
