import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));
vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  enqueueJobs: enqueueJobsMock,
}));

import {
  MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  scheduleMeetings,
  scheduleUpcomingPersonMeetings,
} from 'src/utils/schedule-meetings';

// 3-day periods count from the epoch: the one holding NOW starts on 2026-06-12.
const NOW = '2026-06-12T12:00:00.000Z';
const NEXT_PERIOD_START = '2026-06-15T00:00:00.000Z';
const MINUTE_MS = 60 * 1000;

const enqueuedFor = (logicFunctionUniversalIdentifier: string) =>
  enqueueJobsMock.mock.calls
    .map(([input]) => input)
    .filter(
      (input) =>
        input.logicFunctionUniversalIdentifier ===
        logicFunctionUniversalIdentifier,
    );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduleMeetings', () => {
  it('should enqueue one job per slot, delayed until just after the slot ends', async () => {
    await scheduleMeetings([
      '2026-06-12T12:05:00.000Z',
      '2026-06-12T12:14:59.000Z',
      '2026-06-12T13:30:00.000Z',
    ]);

    expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobsMock.mock.calls[0][0]).toEqual({
      logicFunctionUniversalIdentifier:
        MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `meeting-slot-${Date.parse('2026-06-12T12:00:00.000Z')}`,
          payload: {
            slotStart: '2026-06-12T12:00:00.000Z',
            slotEnd: '2026-06-12T12:15:00.000Z',
          },
        },
      ],
      delayMs: 16 * MINUTE_MS,
      retryLimit: 3,
    });
    expect(enqueueJobsMock.mock.calls[1][0].delayMs).toBe(106 * MINUTE_MS);
  });

  it('should skip started meetings and unparsable start times', async () => {
    await scheduleMeetings(['2026-06-12T11:59:00.000Z', NOW, 'not-a-date']);

    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should leave meetings past the 6 day horizon to one horizon job at the next period', async () => {
    await scheduleMeetings([
      '2026-06-18T12:00:01.000Z',
      '2026-09-01T09:00:00.000Z',
    ]);

    expect(enqueuedFor(MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER))
      .toHaveLength(0);
    expect(
      enqueuedFor(MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER),
    ).toEqual([
      {
        logicFunctionUniversalIdentifier:
          MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: [
          {
            jobId: `meeting-horizon-${Date.parse(NEXT_PERIOD_START)}`,
            payload: {},
          },
        ],
        delayMs: Date.parse(NEXT_PERIOD_START) - Date.parse(NOW),
        retryLimit: 3,
      },
    ]);
  });
});

describe('scheduleUpcomingPersonMeetings', () => {
  const buildClient = (startsAts: string[], hasNextPage = false) => {
    const queryMock = vi.fn().mockResolvedValue({
      calendarEventParticipants: {
        edges: startsAts.map((startsAt, index) => ({
          node: {
            personId: `person-${index}`,
            calendarEventId: `event-${index}`,
            calendarEvent: { startsAt },
          },
        })),
        pageInfo: { hasNextPage, endCursor: 'cursor' },
      },
    });

    return { client: { query: queryMock } as unknown as CoreApiClient, queryMock };
  };

  it('should read upcoming person meetings earliest first through the calendar event relation', async () => {
    const { client, queryMock } = buildClient([]);

    await scheduleUpcomingPersonMeetings(client);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].calendarEventParticipants.__args).toEqual(
      {
        filter: {
          and: [
            { personId: { is: 'NOT_NULL' } },
            { calendarEvent: { startsAt: { gte: NOW } } },
            { calendarEvent: { isCanceled: { eq: false } } },
          ],
        },
        orderBy: [{ calendarEvent: { startsAt: 'AscNullsLast' } }],
        first: 200,
        after: undefined,
      },
    );
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should stop paging at the first meeting past the horizon and chain the next run', async () => {
    const { client, queryMock } = buildClient(
      ['2026-06-13T09:00:00.000Z', '2026-07-01T09:00:00.000Z'],
      true,
    );

    await scheduleUpcomingPersonMeetings(client);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(
      enqueuedFor(MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER),
    ).toHaveLength(1);
    expect(
      enqueuedFor(MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER),
    ).toHaveLength(1);
  });
});
