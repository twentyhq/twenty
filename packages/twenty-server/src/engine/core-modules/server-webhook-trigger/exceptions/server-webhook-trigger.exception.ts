import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ServerWebhookTriggerExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED = 'SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED',
  WORKSPACE_ID_NOT_RESOLVED = 'WORKSPACE_ID_NOT_RESOLVED',
  APPLICATION_NOT_INSTALLED = 'APPLICATION_NOT_INSTALLED',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  SERVER_WEBHOOK_USER_UNCAUGHT_ERROR = 'SERVER_WEBHOOK_USER_UNCAUGHT_ERROR',
  SERVER_WEBHOOK_PLATFORM_ERROR = 'SERVER_WEBHOOK_PLATFORM_ERROR',
}

const getServerWebhookTriggerExceptionUserFriendlyMessage = (
  code: ServerWebhookTriggerExceptionCode,
) => {
  switch (code) {
    case ServerWebhookTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      return msg`Application registration not found.`;
    case ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED:
      return msg`Server webhook trigger is not configured for this application registration.`;
    case ServerWebhookTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
      return msg`Could not resolve a workspace from the webhook payload.`;
    case ServerWebhookTriggerExceptionCode.APPLICATION_NOT_INSTALLED:
      return msg`Application is not installed in this workspace.`;
    case ServerWebhookTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Logic function not found.`;
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
