import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SlackAssistantExceptionCode {
  MISSING_REQUEST_BODY = 'MISSING_REQUEST_BODY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNING_SECRET_NOT_CONFIGURED = 'SIGNING_SECRET_NOT_CONFIGURED',
}

const getSlackAssistantExceptionUserFriendlyMessage = (
  code: SlackAssistantExceptionCode,
) => {
  switch (code) {
    case SlackAssistantExceptionCode.MISSING_REQUEST_BODY:
      return msg`Missing request body.`;
    case SlackAssistantExceptionCode.INVALID_SIGNATURE:
      return msg`Invalid Slack request signature.`;
    case SlackAssistantExceptionCode.SIGNING_SECRET_NOT_CONFIGURED:
      return msg`The Slack signing secret is not configured.`;
    default:
      return assertUnreachable(code);
  }
};

export class SlackAssistantException extends CustomException<SlackAssistantExceptionCode> {
  constructor(
    message: string,
    code: SlackAssistantExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getSlackAssistantExceptionUserFriendlyMessage(code),
    });
  }
}
