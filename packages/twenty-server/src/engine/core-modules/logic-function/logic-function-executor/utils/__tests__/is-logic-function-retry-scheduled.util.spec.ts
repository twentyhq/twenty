import { isLogicFunctionRetryScheduled } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/is-logic-function-retry-scheduled.util';

const RETRYABLE_ERROR = {
  errorType: 'RetryableLogicFunctionError',
  errorMessage: 'The remote dependency is temporarily unavailable',
  stackTrace: [],
};

describe('isLogicFunctionRetryScheduled', () => {
  it('returns true for a retryable error with retries left', () => {
    expect(
      isLogicFunctionRetryScheduled({
        error: RETRYABLE_ERROR,
        retry: { retryCount: 2, maxRetries: 3 },
      }),
    ).toBe(true);
  });

  it('returns false for a retryable error on the last attempt', () => {
    expect(
      isLogicFunctionRetryScheduled({
        error: RETRYABLE_ERROR,
        retry: { retryCount: 3, maxRetries: 3 },
      }),
    ).toBe(false);
  });

  it('returns false for a retryable error when the caller never retries', () => {
    expect(
      isLogicFunctionRetryScheduled({
        error: RETRYABLE_ERROR,
        retry: { retryCount: 0, maxRetries: 0 },
      }),
    ).toBe(false);
  });

  it('returns false for an ordinary error', () => {
    expect(
      isLogicFunctionRetryScheduled({
        error: {
          errorType: 'TypeError',
          errorMessage: 'Cannot read properties of undefined',
          stackTrace: [],
        },
        retry: { retryCount: 0, maxRetries: 3 },
      }),
    ).toBe(false);
  });

  it('returns false when the execution has no error', () => {
    expect(
      isLogicFunctionRetryScheduled({
        error: undefined,
        retry: { retryCount: 0, maxRetries: 3 },
      }),
    ).toBe(false);
  });
});
