import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

export class GranolaUnavailableError extends RetryableLogicFunctionError {
  readonly retryAfterMilliseconds: number;

  constructor({
    status,
    retryAfterMilliseconds,
  }: {
    status: number;
    retryAfterMilliseconds: number;
  }) {
    super(`Granola is temporarily unavailable (HTTP ${status}).`);
    this.retryAfterMilliseconds = retryAfterMilliseconds;
  }
}
