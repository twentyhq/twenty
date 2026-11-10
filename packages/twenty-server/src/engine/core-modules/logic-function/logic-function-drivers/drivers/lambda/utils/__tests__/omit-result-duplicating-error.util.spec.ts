import { enforceHttpEgressResultSize } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/enforce-http-egress-result-size.util';
import { omitResultDuplicatingError } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/omit-result-duplicating-error.util';
import { restoreResultDuplicatingError } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/restore-result-duplicating-error.util';

const REQUEST = {
  input: { url: 'https://api.example.com', method: 'GET' as const },
  limits: { timeoutMs: 30_000, maxPayloadSizeBytes: 4 * 1024 * 1024 },
  context: { workspaceId: 'workspace-id', source: 'workflow-http' as const },
};

// Axios gives an HTTP error's parsed body to both fields, whatever ToolOutput declares.
const buildHttpErrorResponse = (body: object) => ({
  toolOutput: {
    success: false,
    message: 'HTTP GET request to https://api.example.com failed',
    error: body as unknown as string,
    result: body,
    status: 404,
  },
  outcomeDetails: {
    outcome: 'http-error' as const,
    status: 404,
    durationMs: 1,
  },
});

describe('omitResultDuplicatingError', () => {
  it('sends an HTTP error body once and restores it on the server', () => {
    const response = buildHttpErrorResponse({ error: 'nope' });

    const lambdaResponse = omitResultDuplicatingError(response);

    expect(lambdaResponse.toolOutput).not.toHaveProperty('result');
    expect(restoreResultDuplicatingError(lambdaResponse)).toEqual(response);
  });

  it('keeps a result that is not the error', () => {
    const response = {
      toolOutput: { success: true, message: 'ok', result: { ok: true } },
      outcomeDetails: { outcome: 'success' as const, durationMs: 1 },
    };

    expect(omitResultDuplicatingError(response)).toBe(response);
    expect(restoreResultDuplicatingError(response)).toEqual(response);
  });

  it('lets an error body through the size check like a success body of the same size', () => {
    const response = buildHttpErrorResponse({ text: 'x'.repeat(3_000_000) });

    expect(
      enforceHttpEgressResultSize(REQUEST, omitResultDuplicatingError(response))
        .toolOutput.error,
    ).toBe(response.toolOutput.error);
  });
});
