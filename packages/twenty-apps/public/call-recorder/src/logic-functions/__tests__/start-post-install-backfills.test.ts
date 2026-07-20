import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import postInstallLogicFunction, {
  startPostInstallBackfillsHandler,
} from 'src/logic-functions/start-post-install-backfills';

const FUNCTIONS_BASE_URL = 'https://acme.functions.example.com';

const fetchMock = vi.fn();

const fetchedRoutePaths = (): string[] =>
  fetchMock.mock.calls.map(([requestUrl]) =>
    String(requestUrl).replace(FUNCTIONS_BASE_URL, ''),
  );

describe('start-post-install-backfills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', FUNCTIONS_BASE_URL);
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured to run on app version upgrades', () => {
    expect(postInstallLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'start-post-install-backfills',
        timeoutSeconds: 30,
        shouldRunOnVersionUpgrade: true,
      }),
    );
  });

  it('seeds the sweep and skips summaries on a fresh install', async () => {
    const result = await startPostInstallBackfillsHandler({
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'sweep-requested',
      summaryBackfillOutcome: 'skipped-initial-install',
    });
    expect(fetchedRoutePaths()).toEqual([
      RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    ]);
  });

  it('backfills summaries and skips the sweep on an upgrade', async () => {
    const result = await startPostInstallBackfillsHandler({
      previousVersion: '1.0.6',
      newVersion: '1.0.7',
    });

    expect(result).toEqual({
      calendarEventSweepOutcome: 'skipped-upgrade',
      summaryBackfillOutcome: 'backfill-requested',
    });
    expect(fetchedRoutePaths()).toEqual([
      GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
    ]);
  });

  it('throws when the fresh-install sweep kickoff fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({ newVersion: '1.0.7' }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: upcoming calendar event sweep',
    );
    expect(fetchedRoutePaths()).not.toContain(
      GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
    );
  });

  it('throws when the upgrade summary backfill kickoff fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failed'));

    await expect(
      startPostInstallBackfillsHandler({
        previousVersion: '1.0.6',
        newVersion: '1.0.7',
      }),
    ).rejects.toThrow(
      'Failed to start post-install backfills: call recording summary backfill',
    );
    expect(fetchedRoutePaths()).not.toContain(
      RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH,
    );
  });
});
