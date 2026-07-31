import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';

const fetchMock = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

const readFirefliesListVariables = () => {
  const [, request] = fetchMock.mock.calls[0];
  const requestBody = JSON.parse(String((request as RequestInit).body)) as {
    variables: {
      fromDate: string;
      toDate: string;
      skip: number;
    };
  };

  return requestBody.variables;
};

describe('firefliesBackfillHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('FIREFLIES_API_KEY', 'fireflies-api-key');
    fetchMock.mockResolvedValue(
      new Response('invalid request', { status: 400 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('preserves the complete date window from a continuation cursor', async () => {
    const continuationCursor = {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 50,
    };

    const result = await firefliesBackfillHandler({
      cursor: continuationCursor,
    });

    expect(readFirefliesListVariables()).toEqual({
      ...continuationCursor,
      limit: 50,
    });
    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'list-failed',
        fromDate: continuationCursor.fromDate,
        isContinuationEnqueued: false,
      }),
    );
  });
});
