import { willRetryLogicFunctionExecution } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/will-retry-logic-function-execution.util';

const RETRYABLE_ERROR = {
  errorType: 'RetryableLogicFunctionError',
  errorMessage: 'The remote dependency is temporarily unavailable',
  stackTrace: [],
};

describe('willRetryLogicFunctionExecution', () => {
  it('returns true for a retryable error with retries left', () => {
    expect(
      willRetryLogicFunctionExecution(RETRYABLE_ERROR, {
        retryCount: 2,
        maxRetries: 3,
      }),
    ).toBe(true);
  });

  it('returns false for a retryable error on the last attempt', () => {
    expect(
      willRetryLogicFunctionExecution(RETRYABLE_ERROR, {
        retryCount: 3,
        maxRetries: 3,
      }),
    ).toBe(false);
  });

  it('returns false for a retryable error when the caller never retries', () => {
    expect(
      willRetryLogicFunctionExecution(RETRYABLE_ERROR, {
        retryCount: 0,
        maxRetries: 0,
      }),
    ).toBe(false);
  });

  it('returns false for an ordinary error', () => {
    expect(
      willRetryLogicFunctionExecution(
        {
          errorType: 'TypeError',
          errorMessage: 'Cannot read properties of undefined',
          stackTrace: [],
        },
        { retryCount: 0, maxRetries: 3 },
      ),
    ).toBe(false);
  });

  it('returns false when the execution has no error', () => {
    expect(
      willRetryLogicFunctionExecution(undefined, {
        retryCount: 0,
        maxRetries: 3,
      }),
    ).toBe(false);
  });
});
