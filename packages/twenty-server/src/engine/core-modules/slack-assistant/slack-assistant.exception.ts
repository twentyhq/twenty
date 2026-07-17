import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum SlackAssistantExceptionCode {
  MISSING_REQUEST_BODY = 'MISSING_REQUEST_BODY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNING_SECRET_NOT_CONFIGURED = 'SIGNING_SECRET_NOT_CONFIGURED',
}

const GENERIC_USER_FRIENDLY_MESSAGE = msg`Something went wrong. Please try again.`;

export class SlackAssistantException extends CustomException<SlackAssistantExceptionCode> {
  constructor(
    message: string,
    code: SlackAssistantExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? GENERIC_USER_FRIENDLY_MESSAGE,
    });
  }
}
