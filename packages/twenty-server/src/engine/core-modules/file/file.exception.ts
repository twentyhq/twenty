import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FileExceptionCode = appendCommonExceptionCode({
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
} as const);

const getFileExceptionUserFriendlyMessage = (
  code: keyof typeof FileExceptionCode,
) => {
  switch (code) {
    case FileExceptionCode.UNAUTHENTICATED:
      return msg`Authentication is required.`;
    case FileExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
    case FileExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class FileException extends CustomException<
  keyof typeof FileExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FileExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getFileExceptionUserFriendlyMessage(code),
    });
  }
}
