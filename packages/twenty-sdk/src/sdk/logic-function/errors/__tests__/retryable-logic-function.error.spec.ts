import { describe, expect, it } from 'vitest';

import { RetryableLogicFunctionError } from '@/sdk/logic-function';

describe('RetryableLogicFunctionError', () => {
  it('preserves the retry protocol error name across runtime serialization', () => {
    const retryableLogicFunctionError = new RetryableLogicFunctionError(
      'The remote dependency is temporarily unavailable',
    );

    expect(retryableLogicFunctionError).toBeInstanceOf(Error);
    expect(retryableLogicFunctionError.name).toBe(
      'RetryableLogicFunctionError',
    );
    expect(retryableLogicFunctionError.message).toBe(
      'The remote dependency is temporarily unavailable',
    );
  });
});
