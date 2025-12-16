import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum AuditExceptionCode {
  INVALID_TYPE = 'INVALID_TYPE',
  INVALID_INPUT = 'INVALID_INPUT',
}

const auditExceptionUserFriendlyMessages: Record<
  AuditExceptionCode,
  MessageDescriptor
> = {
  [AuditExceptionCode.INVALID_TYPE]: msg`Invalid audit type.`,
  [AuditExceptionCode.INVALID_INPUT]: msg`Invalid audit input.`,
};

export class AuditException extends CustomException<AuditExceptionCode> {
  constructor(
    message: string,
    code: AuditExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? auditExceptionUserFriendlyMessages[code],
    });
  }
}
