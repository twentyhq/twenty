import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ApplicationRegistrationWebhookExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  WEBHOOK_INGRESS_NOT_CONFIGURED = 'WEBHOOK_INGRESS_NOT_CONFIGURED',
  WORKSPACE_ID_NOT_RESOLVED = 'WORKSPACE_ID_NOT_RESOLVED',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  WEBHOOK_USER_UNCAUGHT_ERROR = 'WEBHOOK_USER_UNCAUGHT_ERROR',
  WEBHOOK_PLATFORM_ERROR = 'WEBHOOK_PLATFORM_ERROR',
}

const getApplicationRegistrationWebhookExceptionUserFriendlyMessage = (
  code: ApplicationRegistrationWebhookExceptionCode,
) => {
  switch (code) {
    case ApplicationRegistrationWebhookExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      return msg`Application registration not found.`;
    case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_INGRESS_NOT_CONFIGURED:
      return msg`Webhook ingress is not configured for this application registration.`;
    case ApplicationRegistrationWebhookExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
      return msg`Could not resolve a workspace from the webhook payload.`;
    case ApplicationRegistrationWebhookExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case ApplicationRegistrationWebhookExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Logic function not found.`;
    case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_USER_UNCAUGHT_ERROR:
      return msg`Logic function execution failed.`;
    case ApplicationRegistrationWebhookExceptionCode.WEBHOOK_PLATFORM_ERROR:
      return msg`An unexpected error occurred while handling the webhook.`;
    default:
      assertUnreachable(code);
  }
};

export class ApplicationRegistrationWebhookException extends CustomException<ApplicationRegistrationWebhookExceptionCode> {
  constructor(
    message: string,
    code: ApplicationRegistrationWebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getApplicationRegistrationWebhookExceptionUserFriendlyMessage(code),
    });
  }
}
