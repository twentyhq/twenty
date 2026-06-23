import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ServerWebhookTriggerExceptionCode {
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  SERVER_WEBHOOK_USER_UNCAUGHT_ERROR = 'SERVER_WEBHOOK_USER_UNCAUGHT_ERROR',
  SERVER_WEBHOOK_PLATFORM_ERROR = 'SERVER_WEBHOOK_PLATFORM_ERROR',
}

const getServerWebhookTriggerExceptionUserFriendlyMessage = (
  code: ServerWebhookTriggerExceptionCode,
) => {
  switch (code) {
    case ServerWebhookTriggerExceptionCode.FEATURE_DISABLED:
      return msg`Server logic functions are disabled on this instance.`;
    case ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Server logic function not found.`;
    case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR:
      return msg`Logic function execution failed.`;
    case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_PLATFORM_ERROR:
      return msg`An unexpected error occurred while handling the webhook.`;
    default:
      assertUnreachable(code);
  }
};

export class ServerWebhookTriggerException extends CustomException<ServerWebhookTriggerExceptionCode> {
  constructor(
    message: string,
    code: ServerWebhookTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getServerWebhookTriggerExceptionUserFriendlyMessage(code),
    });
  }
}
