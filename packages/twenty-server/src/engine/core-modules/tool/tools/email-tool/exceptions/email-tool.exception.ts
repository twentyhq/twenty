import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum EmailToolExceptionCode {
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_ID = 'INVALID_FILE_ID',
}

const getEmailToolExceptionUserFriendlyMessage = (
  code: EmailToolExceptionCode,
) => {
  switch (code) {
    case EmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID:
      return msg`Invalid connected account ID.`;
    case EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND:
      return msg`Connected account not found.`;
    case EmailToolExceptionCode.INVALID_EMAIL:
      return msg`Invalid email address.`;
    case EmailToolExceptionCode.WORKSPACE_ID_NOT_FOUND:
      return msg`Workspace not found.`;
    case EmailToolExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
    case EmailToolExceptionCode.INVALID_FILE_ID:
      return msg`Invalid file ID.`;
    default:
      assertUnreachable(code);
  }
};

export class EmailToolException extends CustomException<EmailToolExceptionCode> {
  constructor(
    message: string,
    code: EmailToolExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEmailToolExceptionUserFriendlyMessage(code),
    });
  }
}
