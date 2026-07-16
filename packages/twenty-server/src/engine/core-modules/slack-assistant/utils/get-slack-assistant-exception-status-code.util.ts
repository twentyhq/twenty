import { assertUnreachable } from 'twenty-shared/utils';

import {
  type SlackAssistantException,
  SlackAssistantExceptionCode,
} from 'src/engine/core-modules/slack-assistant/slack-assistant.exception';

export const getSlackAssistantExceptionStatusCode = (
  exception: SlackAssistantException,
): 400 | 401 | 500 => {
  switch (exception.code) {
    case SlackAssistantExceptionCode.MISSING_REQUEST_BODY:
      return 400;
    case SlackAssistantExceptionCode.INVALID_SIGNATURE:
      return 401;
    case SlackAssistantExceptionCode.SIGNING_SECRET_NOT_CONFIGURED:
      return 500;
    default:
      return assertUnreachable(exception.code);
  }
};
