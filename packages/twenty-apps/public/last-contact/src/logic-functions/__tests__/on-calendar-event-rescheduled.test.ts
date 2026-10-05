import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));
vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

import onCalendarEventRescheduled from '../on-calendar-event-rescheduled';

const NOW = '2026-06-12T12:00:00.000Z';

const handler = onCalendarEventRescheduled.config.handler as (
  batch: unknown,
) => Promise<void>;

const buildBatch = (
  calendarEvents: { startsAt: string | null; isCanceled: boolean }[],
) => ({
  name: 'calendarEvent.updated',
  events: calendarEvents.map((after, index) => ({
    recordId: `event-${index}`,
    properties: { updatedFields: ['startsAt'], after },
  })),
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('on-calendar-event-rescheduled', () => {
  it('should be valid and batch start time updates', () => {
    expect(onCalendarEventRescheduled.success).toBe(true);
    expect(
      onCalendarEventRescheduled.config.databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'calendarEvent.updated',
      updatedFields: ['startsAt'],
      batchMode: true,
    });
  });

  it('should schedule the new slot of upcoming meetings only', async () => {
    await handler(
      buildBatch([
        { startsAt: '2026-06-12T14:20:00.000Z', isCanceled: false },
        { startsAt: '2026-06-12T14:24:00.000Z', isCanceled: false },
        { startsAt: '2026-06-12T16:00:00.000Z', isCanceled: true },
        { startsAt: '2026-06-12T10:00:00.000Z', isCanceled: false },
        { startsAt: null, isCanceled: false },
      ]),
    );

    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobsMock.mock.calls[0][0].jobs[0].payload).toEqual({
      slotStart: '2026-06-12T14:20:00.000Z',
      slotEnd: '2026-06-12T14:25:00.000Z',
    });
  });
});
