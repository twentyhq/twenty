import { enforceHttpEgressResultSize } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/enforce-http-egress-result-size.util';

const REQUEST = {
  input: { url: 'https://api.example.com', method: 'GET' as const },
  limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 4 * 1024 * 1024 },
  context: { workspaceId: 'workspace-id', source: 'workflow-http' as const },
};

describe('enforceHttpEgressResultSize', () => {
  it('returns a result that fits the invoke limit unchanged', () => {
    const response = {
      toolOutput: { success: true, message: 'ok', result: { ok: true } },
      outcomeDetails: { outcome: 'success' as const, durationMs: 1 },
    };

    expect(enforceHttpEgressResultSize(REQUEST, response)).toBe(response);
  });

  it('replaces a result that JSON escaping pushed over the limit', () => {
    const response = {
      toolOutput: {
        success: true,
        message: 'ok',
        status: 200,
        result: { quotes: '"'.repeat(3_000_000) },
      },
      outcomeDetails: {
        outcome: 'success' as const,
        status: 200,
        durationMs: 1,
      },
    };

    expect(enforceHttpEgressResultSize(REQUEST, response)).toEqual({
      toolOutput: {
        success: false,
        message: 'HTTP GET request to https://api.example.com failed',
        error: 'The response is too large to return',
        status: 200,
      },
      outcomeDetails: {
        outcome: 'other-error',
        status: 200,
        durationMs: 1,
        errorCode: 'RESULT_TOO_LARGE',
      },
    });
  });
});
