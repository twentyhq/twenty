import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FileExceptionCode = appendCommonExceptionCode({
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
} as const);

const fileExceptionUserFriendlyMessages: Record<
  keyof typeof FileExceptionCode,
  MessageDescriptor
> = {
  UNAUTHENTICATED: msg`Authentication is required.`,
  FILE_NOT_FOUND: msg`File not found.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
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
        userFriendlyMessage ?? fileExceptionUserFriendlyMessages[code],
    });
  }
}
