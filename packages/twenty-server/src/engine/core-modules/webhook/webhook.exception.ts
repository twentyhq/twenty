import { CustomException } from 'src/utils/custom-exception';

export class WebhookException extends CustomException<WebhookExceptionCode> {}

export enum WebhookExceptionCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  INVALID_TARGET_URL = 'INVALID_TARGET_URL',
}
