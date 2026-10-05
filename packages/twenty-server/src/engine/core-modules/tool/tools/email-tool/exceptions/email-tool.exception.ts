import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum EmailToolExceptionCode {
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  WORKSPACE_ID_NOT_FOUND = 'WORKSPACE_ID_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_ID = 'INVALID_FILE_ID',
  TOO_MANY_RECIPIENTS = 'TOO_MANY_RECIPIENTS',
  NO_EMAIL_CAPABLE_CONNECTED_ACCOUNT = 'NO_EMAIL_CAPABLE_CONNECTED_ACCOUNT',
  CONNECTED_ACCOUNT_NOT_EMAIL_CAPABLE = 'CONNECTED_ACCOUNT_NOT_EMAIL_CAPABLE',
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
    case EmailToolExceptionCode.TOO_MANY_RECIPIENTS:
      return msg`Too many recipients.`;
    case EmailToolExceptionCode.NO_EMAIL_CAPABLE_CONNECTED_ACCOUNT:
      return msg`No mailbox is connected for this action. Connect one in Settings.`;
    case EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_EMAIL_CAPABLE:
      return msg`This connected account cannot be used for this action.`;
    default:
      assertUnreachable(code);
  }
};
const EMAIL_TOOL_EXCEPTION_CATEGORY_BY_CODE = {
  [EmailToolExceptionCode.INVALID_CONNECTED_ACCOUNT_ID]:
    'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.INVALID_EMAIL]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.WORKSPACE_ID_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.FILE_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.INVALID_FILE_ID]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.TOO_MANY_RECIPIENTS]: 'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.NO_EMAIL_CAPABLE_CONNECTED_ACCOUNT]:
    'INTERNAL_SERVER_ERROR',
  [EmailToolExceptionCode.CONNECTED_ACCOUNT_NOT_EMAIL_CAPABLE]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<EmailToolExceptionCode, ExceptionCategory>;

export class EmailToolException extends CustomException<EmailToolExceptionCode> {
  constructor(
    message: string,
    code: EmailToolExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getEmailToolExceptionUserFriendlyMessage(code),
      category: EMAIL_TOOL_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
