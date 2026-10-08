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
    // Keeps the inherited name: the platform only retries errors named RetryableLogicFunctionError
    super(`Granola is temporarily unavailable (HTTP ${status}).`);
    this.retryAfterMilliseconds = retryAfterMilliseconds;
  }
}
