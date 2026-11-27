export class TelegramApiError extends Error {
  readonly method: string;
  readonly errorCode: number | undefined;
  readonly retryAfterSeconds: number | undefined;

  constructor({
    method,
    errorCode,
    description,
    retryAfterSeconds,
  }: {
    method: string;
    errorCode?: number;
    description: string;
    retryAfterSeconds?: number;
  }) {
    super(`Telegram ${method} failed: ${description}`);
    this.name = 'TelegramApiError';
    this.method = method;
    this.errorCode = errorCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
