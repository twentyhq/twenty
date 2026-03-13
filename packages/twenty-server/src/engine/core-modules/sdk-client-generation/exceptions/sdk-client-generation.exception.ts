import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SdkClientGenerationExceptionCode {
  ARCHIVE_NOT_FOUND = 'ARCHIVE_NOT_FOUND',
  ARCHIVE_EXTRACTION_FAILED = 'ARCHIVE_EXTRACTION_FAILED',
  FILE_NOT_FOUND_IN_ARCHIVE = 'FILE_NOT_FOUND_IN_ARCHIVE',
  GENERATION_FAILED = 'GENERATION_FAILED',
}

const getSdkClientGenerationExceptionUserFriendlyMessage = (
  code: SdkClientGenerationExceptionCode,
) => {
  switch (code) {
    case SdkClientGenerationExceptionCode.ARCHIVE_NOT_FOUND:
      return msg`SDK client archive not found. The SDK client may not have been generated for this application.`;
    case SdkClientGenerationExceptionCode.ARCHIVE_EXTRACTION_FAILED:
      return msg`Failed to extract SDK client archive.`;
    case SdkClientGenerationExceptionCode.FILE_NOT_FOUND_IN_ARCHIVE:
      return msg`File not found in SDK client archive.`;
    case SdkClientGenerationExceptionCode.GENERATION_FAILED:
      return msg`Failed to generate SDK client.`;
    default:
      assertUnreachable(code);
  }
};

export class SdkClientGenerationException extends CustomException<SdkClientGenerationExceptionCode> {
  constructor(
    message: string,
    code: SdkClientGenerationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getSdkClientGenerationExceptionUserFriendlyMessage(code),
    });
  }
}
