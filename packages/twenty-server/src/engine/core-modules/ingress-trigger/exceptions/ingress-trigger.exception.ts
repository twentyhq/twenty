import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum IngressTriggerExceptionCode {
  APPLICATION_REGISTRATION_NOT_FOUND = 'APPLICATION_REGISTRATION_NOT_FOUND',
  INGRESS_TRIGGER_NOT_CONFIGURED = 'INGRESS_TRIGGER_NOT_CONFIGURED',
  WORKSPACE_ID_NOT_RESOLVED = 'WORKSPACE_ID_NOT_RESOLVED',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  INGRESS_USER_UNCAUGHT_ERROR = 'INGRESS_USER_UNCAUGHT_ERROR',
  INGRESS_PLATFORM_ERROR = 'INGRESS_PLATFORM_ERROR',
}

const getIngressTriggerExceptionUserFriendlyMessage = (
  code: IngressTriggerExceptionCode,
) => {
  switch (code) {
    case IngressTriggerExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND:
      return msg`Application registration not found.`;
    case IngressTriggerExceptionCode.INGRESS_TRIGGER_NOT_CONFIGURED:
      return msg`Webhook ingress is not configured for this application registration.`;
    case IngressTriggerExceptionCode.WORKSPACE_ID_NOT_RESOLVED:
      return msg`Could not resolve a workspace from the webhook payload.`;
    case IngressTriggerExceptionCode.WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case IngressTriggerExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Logic function not found.`;
    case IngressTriggerExceptionCode.INGRESS_USER_UNCAUGHT_ERROR:
      return msg`Logic function execution failed.`;
    case IngressTriggerExceptionCode.INGRESS_PLATFORM_ERROR:
      return msg`An unexpected error occurred while handling the webhook.`;
    default:
      assertUnreachable(code);
  }
};

export class IngressTriggerException extends CustomException<IngressTriggerExceptionCode> {
  constructor(
    message: string,
    code: IngressTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getIngressTriggerExceptionUserFriendlyMessage(code),
    });
  }
}
