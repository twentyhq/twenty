import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum SendEmailToolExceptionCode {
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_ID = 'INVALID_FILE_ID',
}

const sendEmailToolExceptionUserFriendlyMessages: Record<
  SendEmailToolExceptionCode,
  MessageDescriptor
> = {
  [SendEmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID]: msg`Invalid connected account ID.`,
  [SendEmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND]: msg`Connected account not found.`,
  [SendEmailToolExceptionCode.INVALID_EMAIL]: msg`Invalid email address.`,
  [SendEmailToolExceptionCode.WORKSPACE_ID_NOT_FOUND]: msg`Workspace not found.`,
  [SendEmailToolExceptionCode.FILE_NOT_FOUND]: msg`File not found.`,
  [SendEmailToolExceptionCode.INVALID_FILE_ID]: msg`Invalid file ID.`,
};

export class SendEmailToolException extends CustomException<SendEmailToolExceptionCode> {
  constructor(
    message: string,
    code: SendEmailToolExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? sendEmailToolExceptionUserFriendlyMessages[code],
    });
  }
}
