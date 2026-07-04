import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { reconcileUpcomingCalendarEventBatches } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util';

const reconcileCallRecorderForCalendarEventIdsMock = vi.hoisted(() => vi.fn());
const requestUpcomingCalendarEventsReconciliationMock = vi.hoisted(() =>
  vi.fn(),
);

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds:
    reconcileCallRecorderForCalendarEventIdsMock,
}));

vi.mock(
  'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util',
  () => ({
    requestUpcomingCalendarEventsReconciliation:
      requestUpcomingCalendarEventsReconciliationMock,
  }),
);

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    mutation: vi.fn(),
    query: vi.fn(),
  },
);

const buildCalendarEventIds = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `calendar-event-${index + 1}`);

describe('reconcileUpcomingCalendarEventBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reconcileCallRecorderForCalendarEventIdsMock.mockResolvedValue([
      {
        action: 'CREATED',
        realMeetingKey: 'link:meet.example.com/abc:2026-07-05T10:00:00.000Z',
        callRecordingId: 'call-recording-1',
      },
    ]);
    requestUpcomingCalendarEventsReconciliationMock.mockResolvedValue(true);
  });

  it('reconciles every batch when the deadline is far away', async () => {
    const calendarEventIds = buildCalendarEventIds(30);

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(reconcileCallRecorderForCalendarEventIdsMock).toHaveBeenCalledTimes(
      2,
    );
    expect(
      reconcileCallRecorderForCalendarEventIdsMock,
    ).toHaveBeenNthCalledWith(1, {
      client: CLIENT,
      calendarEventIds: calendarEventIds.slice(0, 25),
    });
    expect(
      reconcileCallRecorderForCalendarEventIdsMock,
    ).toHaveBeenNthCalledWith(2, {
      client: CLIENT,
      calendarEventIds: calendarEventIds.slice(25),
    });
    expect(result.reconciledCalendarEventIds).toEqual(calendarEventIds);
    expect(result.remainingCalendarEventIds).toEqual([]);
    expect(result.actionCounts).toEqual({
      created: 2,
      updated: 0,
      canceled: 0,
      skipped: 0,
      failed: 0,
    });
    expect(result.continuationRequested).toBe(false);
    expect(
      requestUpcomingCalendarEventsReconciliationMock,
    ).not.toHaveBeenCalled();
  });

  it('stops at the deadline and requests a continuation with the remaining ids', async () => {
    const calendarEventIds = buildCalendarEventIds(30);
    // Clock advances 5s per reading: after one batch, 15s + 5s overshoots the deadline.
    let nowMs = 0;
    const getNowMs = () => {
      nowMs += 5_000;

      return nowMs;
    };

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: 15_000,
      getNowMs,
    });

    expect(reconcileCallRecorderForCalendarEventIdsMock).toHaveBeenCalledTimes(
      1,
    );
    expect(result.reconciledCalendarEventIds).toEqual(
      calendarEventIds.slice(0, 25),
    );
    expect(result.remainingCalendarEventIds).toEqual(
      calendarEventIds.slice(25),
    );
    expect(result.continuationRequested).toBe(true);
    expect(
      requestUpcomingCalendarEventsReconciliationMock,
    ).toHaveBeenCalledWith({
      calendarEventIds: calendarEventIds.slice(25),
    });
  });

  it('records a failed batch and keeps processing the next one', async () => {
    const calendarEventIds = buildCalendarEventIds(30);

    reconcileCallRecorderForCalendarEventIdsMock
      .mockRejectedValueOnce(new Error('core api unavailable'))
      .mockResolvedValueOnce([
        {
          action: 'UPDATED',
          realMeetingKey: 'link:meet.example.com/xyz:2026-07-06T10:00:00.000Z',
          callRecordingId: 'call-recording-2',
        },
      ]);

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.failedCalendarEventIds).toEqual(calendarEventIds.slice(0, 25));
    expect(result.reconciledCalendarEventIds).toEqual(
      calendarEventIds.slice(25),
    );
    expect(result.remainingCalendarEventIds).toEqual([]);
    expect(result.actionCounts).toEqual({
      created: 0,
      updated: 1,
      canceled: 0,
      skipped: 0,
      failed: 0,
    });
    expect(result.continuationRequested).toBe(false);
  });

  it('tallies every reconciliation action kind', async () => {
    reconcileCallRecorderForCalendarEventIdsMock.mockResolvedValue([
      {
        action: 'CREATED',
        realMeetingKey: 'meeting-1',
        callRecordingId: 'call-recording-1',
      },
      {
        action: 'CANCELED',
        realMeetingKey: 'meeting-2',
        callRecordingId: 'call-recording-2',
      },
      { action: 'SKIPPED', realMeetingKey: 'meeting-3', callRecordingId: null },
      {
        action: 'FAILED',
        realMeetingKey: 'meeting-4',
        errorMessage: 'recall rejected the bot',
      },
    ]);

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds: buildCalendarEventIds(4),
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.actionCounts).toEqual({
      created: 1,
      updated: 0,
      canceled: 1,
      skipped: 1,
      failed: 1,
    });
  });
});
