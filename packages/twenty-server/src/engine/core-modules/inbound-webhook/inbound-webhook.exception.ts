import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum InboundWebhookExceptionCode {
  SOURCE_NOT_SUPPORTED = 'SOURCE_NOT_SUPPORTED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  MISSING_RAW_BODY = 'MISSING_RAW_BODY',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  REPLAY_WINDOW_EXCEEDED = 'REPLAY_WINDOW_EXCEEDED',
  DUPLICATE_EVENT = 'DUPLICATE_EVENT',
}

const getInboundWebhookExceptionUserFriendlyMessage = (
  code: InboundWebhookExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case InboundWebhookExceptionCode.SOURCE_NOT_SUPPORTED:
      return msg`Inbound webhook source is not supported.`;
    case InboundWebhookExceptionCode.INVALID_SIGNATURE:
      return msg`Inbound webhook signature is invalid.`;
    case InboundWebhookExceptionCode.MISSING_RAW_BODY:
      return msg`Inbound webhook request is missing a raw body.`;
    case InboundWebhookExceptionCode.SUBSCRIPTION_NOT_FOUND:
      return msg`Inbound webhook subscription was not found.`;
    case InboundWebhookExceptionCode.REPLAY_WINDOW_EXCEEDED:
      return msg`Inbound webhook timestamp is outside the accepted replay window.`;
    case InboundWebhookExceptionCode.DUPLICATE_EVENT:
      return msg`Inbound webhook event was already processed.`;
    default:
      assertUnreachable(code);
  }
};

export class InboundWebhookException extends CustomException<InboundWebhookExceptionCode> {
  constructor(
    message: string,
    code: InboundWebhookExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getInboundWebhookExceptionUserFriendlyMessage(code),
    });
  }
}
