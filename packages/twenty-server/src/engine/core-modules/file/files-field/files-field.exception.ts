import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FilesFieldExceptionCode = appendCommonExceptionCode({
  FILE_DELETION_FAILED: 'FILE_DELETION_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_FILE_ID: 'INVALID_FILE_ID',
} as const);

const getFilesFieldExceptionUserFriendlyMessage = (
  code: keyof typeof FilesFieldExceptionCode,
) => {
  switch (code) {
    case FilesFieldExceptionCode.FILE_DELETION_FAILED:
      return msg`Failed to delete file.`;
    case FilesFieldExceptionCode.FILE_NOT_FOUND:
      return msg`File not found.`;
    case FilesFieldExceptionCode.INVALID_FILE_ID:
      return msg`Invalid file ID provided.`;
    case FilesFieldExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class FilesFieldException extends CustomException<
  keyof typeof FilesFieldExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FilesFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getFilesFieldExceptionUserFriendlyMessage(code),
    });
  }
}
