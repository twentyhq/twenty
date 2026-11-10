import { enforceHttpEgressResultSize } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/enforce-http-egress-result-size.util';

describe('enforceHttpEgressResultSize', () => {
  it('returns a result that fits the invoke limit unchanged', () => {
    const response = {
      status: 200,
      body: { ok: true },
      outcomeDetails: { outcome: 'success' as const, durationMs: 1 },
    };

    expect(enforceHttpEgressResultSize(response)).toBe(response);
  });

  it('replaces a result that JSON escaping pushed over the limit', () => {
    const response = {
      status: 200,
      body: { quotes: '"'.repeat(3_000_000) },
      outcomeDetails: {
        outcome: 'success' as const,
        status: 200,
        durationMs: 1,
      },
    };

    expect(enforceHttpEgressResultSize(response)).toEqual({
      status: 200,
      errorMessage: 'The response is too large to return',
      outcomeDetails: {
        outcome: 'other-error',
        status: 200,
        durationMs: 1,
        errorCode: 'RESULT_TOO_LARGE',
      },
    });
  });
});
