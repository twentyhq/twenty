import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { firefliesBackfillHandler } from 'src/logic-functions/handlers/fireflies-backfill-handler';

const runFirefliesBackfillMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/run-fireflies-backfill', () => ({
  runFirefliesBackfill: runFirefliesBackfillMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function CoreApiClient() {
    return {};
  }),
}));

const NOW_MS = Date.parse('2026-07-05T12:00:00.000Z');
const DEADLINE_AT_MS = NOW_MS + 870_000;

describe('firefliesBackfillHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('FIREFLIES_API_KEY', 'api-key');
    runFirefliesBackfillMock.mockResolvedValue({
      stopReason: 'exhausted',
      pageCount: 1,
      syncedCallCount: 3,
      erroredCallCount: 0,
      skippedCallCount: 0,
      continuationRequested: false,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sweeps the default 90-day window when no fromDate is provided', async () => {
    const result = await firefliesBackfillHandler({
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    const expectedFromDate = new Date(
      NOW_MS - 90 * 24 * 60 * 60 * 1_000,
    ).toISOString();

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'completed',
        fromDate: expectedFromDate,
        syncedCallCount: 3,
      }),
    );
    expect(runFirefliesBackfillMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'api-key',
        fromDate: expectedFromDate,
        cursor: undefined,
        deadlineAtMs: DEADLINE_AT_MS,
      }),
    );
  });

  it('derives the window from FIREFLIES_BACKFILL_DAYS', async () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '7');

    await firefliesBackfillHandler({
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    expect(runFirefliesBackfillMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromDate: new Date(NOW_MS - 7 * 24 * 60 * 60 * 1_000).toISOString(),
      }),
    );
  });

  it('is disabled when FIREFLIES_BACKFILL_DAYS is 0 and no fromDate is provided', async () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '0');

    const result = await firefliesBackfillHandler({
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    expect(result).toEqual({ outcome: 'disabled' });
    expect(runFirefliesBackfillMock).not.toHaveBeenCalled();
  });

  it('still runs an explicit fromDate when the automatic backfill is disabled', async () => {
    vi.stubEnv('FIREFLIES_BACKFILL_DAYS', '0');

    const fromDate = '2026-01-01T00:00:00.000Z';
    const cursor = '2026-03-01T00:00:00.000Z';

    const result = await firefliesBackfillHandler({
      fromDate,
      cursor,
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    expect(result).toEqual(expect.objectContaining({ outcome: 'completed' }));
    expect(runFirefliesBackfillMock).toHaveBeenCalledWith(
      expect.objectContaining({ fromDate, cursor }),
    );
  });

  it('no-ops when the Fireflies API key is not configured', async () => {
    vi.stubEnv('FIREFLIES_API_KEY', '');

    const result = await firefliesBackfillHandler({
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    expect(result).toEqual(
      expect.objectContaining({ outcome: 'not-configured' }),
    );
    expect(runFirefliesBackfillMock).not.toHaveBeenCalled();
  });

  it.each([
    ['deadline', 'continuation-requested'],
    ['rate-limited', 'rate-limited'],
    ['list-failed', 'list-failed'],
  ] as const)('maps the %s stop reason to the %s outcome', async (stopReason, outcome) => {
    runFirefliesBackfillMock.mockResolvedValue({
      stopReason,
      pageCount: 1,
      syncedCallCount: 0,
      erroredCallCount: 0,
      skippedCallCount: 0,
      continuationRequested: stopReason !== 'list-failed',
    });

    const result = await firefliesBackfillHandler({
      deadlineAtMs: DEADLINE_AT_MS,
      nowMs: NOW_MS,
    });

    expect(result.outcome).toBe(outcome);
  });
});
