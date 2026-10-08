import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { describe, expect, it } from 'vitest';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';

describe('rethrowKnownOrWrapGranolaError', () => {
  it.each([
    new RetryableLogicFunctionError('retryable'),
    new GranolaApiError({ status: 500 }),
    new GranolaInvalidResponseError(),
  ])('rethrows known errors unchanged', (knownError) => {
    let thrownError: unknown;

    try {
      rethrowKnownOrWrapGranolaError({
        operation: 'History discovery',
        error: knownError,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBe(knownError);
  });

  it('wraps unknown errors as retryable errors', () => {
    expect(() =>
      rethrowKnownOrWrapGranolaError({
        operation: 'History discovery',
        error: new Error('network interrupted'),
      }),
    ).toThrow(
      new RetryableLogicFunctionError(
        '[granola] History discovery failed: network interrupted',
      ),
    );
  });
});
