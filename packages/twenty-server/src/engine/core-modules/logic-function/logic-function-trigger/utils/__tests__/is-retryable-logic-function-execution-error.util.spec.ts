import { isRetryableLogicFunctionExecutionError } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/is-retryable-logic-function-execution-error.util';

describe('isRetryableLogicFunctionExecutionError', () => {
  it('returns true for an explicitly retryable logic function error', () => {
    expect(
      isRetryableLogicFunctionExecutionError({
        errorType: 'RetryableLogicFunctionError',
        errorMessage: 'The remote dependency is temporarily unavailable',
        stackTrace: [],
      }),
    ).toBe(true);
  });

  it('returns false for an ordinary logic function error', () => {
    expect(
      isRetryableLogicFunctionExecutionError({
        errorType: 'TypeError',
        errorMessage: 'Cannot read properties of undefined',
        stackTrace: [],
      }),
    ).toBe(false);
  });

  it('returns false when the execution has no error', () => {
    expect(isRetryableLogicFunctionExecutionError(undefined)).toBe(false);
  });
});
