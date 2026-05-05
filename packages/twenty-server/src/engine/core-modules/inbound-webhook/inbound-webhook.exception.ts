import { CustomException } from 'src/utils/custom-exception';

export enum InboundWebhookExceptionCode {
  SOURCE_NOT_SUPPORTED = 'SOURCE_NOT_SUPPORTED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  MISSING_RAW_BODY = 'MISSING_RAW_BODY',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  REPLAY_WINDOW_EXCEEDED = 'REPLAY_WINDOW_EXCEEDED',
  DUPLICATE_EVENT = 'DUPLICATE_EVENT',
}

export class InboundWebhookException extends CustomException<InboundWebhookExceptionCode> {}
