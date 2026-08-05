import { beforeEach, describe, expect, it, vi } from 'vitest';

import batchJobLogicFunction, {
  reconcileCalendarEventsBatchHandler,
} from 'src/logic-functions/reconcile-calendar-events-batch';

const reconcileCallRecorderForCalendarEventIdsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds:
    reconcileCallRecorderForCalendarEventIdsMock,
}));

describe('reconcileCalendarEventsBatchHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reconcileCallRecorderForCalendarEventIdsMock.mockResolvedValue([]);
  });

  it('declares no external trigger so it only runs as an enqueued job', () => {
    expect(batchJobLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-calendar-events-batch',
        timeoutSeconds: 250,
      }),
    );
    expect(batchJobLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(batchJobLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('reconciles the batch and reports action counts', async () => {
    reconcileCallRecorderForCalendarEventIdsMock.mockResolvedValue([
      { action: 'CREATED', realMeetingKey: 'meeting-1', callRecordingId: 'a' },
      { action: 'SKIPPED', realMeetingKey: 'meeting-2', callRecordingId: null },
      { action: 'FAILED', realMeetingKey: 'meeting-3', errorMessage: 'boom' },
    ]);

    const result = await reconcileCalendarEventsBatchHandler({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
    });

    expect(reconcileCallRecorderForCalendarEventIdsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      }),
    );
    expect(result).toEqual({
      outcome: 'processed',
      actionCounts: {
        created: 1,
        updated: 0,
        canceled: 0,
        skipped: 1,
        failed: 1,
      },
    });
  });

  it('short-circuits a payload without usable calendar event ids', async () => {
    await expect(reconcileCalendarEventsBatchHandler({})).resolves.toEqual({
      outcome: 'nothing-to-reconcile',
    });
    await expect(
      reconcileCalendarEventsBatchHandler({ calendarEventIds: ['', 42] }),
    ).resolves.toEqual({ outcome: 'nothing-to-reconcile' });
    expect(reconcileCallRecorderForCalendarEventIdsMock).not.toHaveBeenCalled();
  });

  it('propagates reconciliation failures so the queue retries the job', async () => {
    reconcileCallRecorderForCalendarEventIdsMock.mockRejectedValue(
      new Error('calendar events query failed'),
    );

    await expect(
      reconcileCalendarEventsBatchHandler({
        calendarEventIds: ['calendar-event-1'],
      }),
    ).rejects.toThrow('calendar events query failed');
  });
});
