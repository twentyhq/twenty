import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SendEmailToolExceptionCode {
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_ID = 'INVALID_FILE_ID',
}

const getSendEmailToolExceptionUserFriendlyMessage = (
  code: SendEmailToolExceptionCode,
) => {
  switch (code) {
    case SendEmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID:
      return msg`Invalid connected account ID.`;
    case SendEmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND:
      return msg`Connected account not found.`;
    case SendEmailToolExceptionCode.INVALID_EMAIL:
      return msg`Invalid email address.`;
    case SendEmailToolExceptionCode.WORKSPACE_ID_NOT_FOUND:
      return msg`Workspace not found.`;
    case SendEmailToolExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
    case SendEmailToolExceptionCode.INVALID_FILE_ID:
      return msg`Invalid file ID.`;
    default:
      assertUnreachable(code);
  }
};

export class SendEmailToolException extends CustomException<SendEmailToolExceptionCode> {
  constructor(
    message: string,
    code: SendEmailToolExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getSendEmailToolExceptionUserFriendlyMessage(code),
    });
  }
}
