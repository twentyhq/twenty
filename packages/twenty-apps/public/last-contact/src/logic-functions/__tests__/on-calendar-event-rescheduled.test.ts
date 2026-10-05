import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { enqueueJobsMock, queryMock, mutationMock, applyMeetingInteractionsMock } =
  vi.hoisted(() => ({
    enqueueJobsMock: vi.fn(),
    queryMock: vi.fn(),
    mutationMock: vi.fn(),
    applyMeetingInteractionsMock: vi.fn(),
  }));
vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));
vi.mock('src/utils/apply-meeting-interactions', () => ({
  applyMeetingInteractions: applyMeetingInteractionsMock,
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
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

const emptyPage = {
  edges: [],
  pageInfo: { hasNextPage: false, endCursor: null },
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
  queryMock.mockReset();
  queryMock.mockResolvedValue({ calendarEventParticipants: emptyPage });
  mutationMock.mockReset();
  applyMeetingInteractionsMock.mockReset();
  applyMeetingInteractionsMock.mockResolvedValue([]);
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
      updatedFields: ['startsAt', 'isCanceled'],
      batchMode: true,
    });
  });

  it('should schedule the new slot of upcoming meetings without calling the core API', async () => {
    await handler(
      buildBatch([
        { startsAt: '2026-06-12T14:20:00.000Z', isCanceled: false },
        { startsAt: '2026-06-12T14:24:00.000Z', isCanceled: false },
        { startsAt: '2026-06-12T16:00:00.000Z', isCanceled: true },
        { startsAt: null, isCanceled: false },
      ]),
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobsMock.mock.calls[0][0].jobs[0].payload).toEqual({
      slotStart: '2026-06-12T14:20:00.000Z',
      slotEnd: '2026-06-12T14:25:00.000Z',
    });
  });

  it('should apply a meeting moved into the past right away', async () => {
    queryMock.mockResolvedValue({
      calendarEventParticipants: {
        edges: [
          {
            node: {
              personId: 'person-1',
              calendarEventId: 'event-0',
              calendarEvent: { startsAt: '2026-06-12T10:00:00.000Z' },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    await handler(
      buildBatch([
        { startsAt: '2026-06-12T10:00:00.000Z', isCanceled: false },
        { startsAt: '2026-06-12T09:00:00.000Z', isCanceled: true },
      ]),
    );

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(
      queryMock.mock.calls[0][0].calendarEventParticipants.__args.filter,
    ).toEqual({
      and: [
        { personId: { is: 'NOT_NULL' } },
        { calendarEventId: { in: ['event-0'] } },
        { calendarEvent: { startsAt: { lt: NOW } } },
        { calendarEvent: { isCanceled: { eq: false } } },
      ],
    });
    expect(applyMeetingInteractionsMock).toHaveBeenCalledWith(
      expect.anything(),
      [
        {
          personId: 'person-1',
          calendarEventId: 'event-0',
          startsAt: '2026-06-12T10:00:00.000Z',
        },
      ],
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
