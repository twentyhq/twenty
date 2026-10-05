import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock, enqueueJobsMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
  enqueueJobsMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));
vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

import meetingSweep from '../meeting-sweep';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const NOW = '2026-06-12T12:00:00.000Z';
const PAST_EVENT_STARTS_AT = '2026-06-12T09:00:00.000Z';
const UPCOMING_EVENT_STARTS_AT = '2026-06-12T15:05:00.000Z';

const handler = meetingSweep.config.handler as () => Promise<void>;

type Page = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const singlePage = (nodes: Record<string, unknown>[]): Page => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const setupQueryMock = (calendarEvents: Record<string, unknown>[]) => {
  queryMock.mockImplementation((query) => {
    if (query.calendarEvents) {
      return Promise.resolve({ calendarEvents: singlePage(calendarEvents) });
    }

    if (query.calendarEventParticipants) {
      const requestedIds: string[] =
        query.calendarEventParticipants.__args.filter.calendarEventId.in;

      return Promise.resolve({
        calendarEventParticipants: singlePage(
          query.calendarEventParticipants.edges.node.calendarEvent
            ? requestedIds.map((calendarEventId) => ({
                calendarEventId,
                isOrganizer: null,
                workspaceMemberId: null,
                calendarEvent: {
                  startsAt: PAST_EVENT_STARTS_AT,
                  isCanceled: false,
                },
              }))
            : requestedIds.map((calendarEventId) => ({
                personId: PERSON_ID,
                calendarEventId,
              })),
        ),
      });
    }

    if (query.people) {
      const requestedIds: string[] = query.people.__args.filter.id.in;
      return Promise.resolve({
        people: singlePage(
          query.people.edges.node.companyId
            ? requestedIds.map((id) => ({ id, companyId: null }))
            : requestedIds.map((id) => ({ id })),
        ),
      });
    }

    if (query.companies) {
      return Promise.resolve({ companies: singlePage([]) });
    }

    return Promise.resolve({ opportunities: singlePage([]) });
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('meeting-sweep definition', () => {
  it('should be valid and have no trigger of its own', () => {
    expect(meetingSweep.success).toBe(true);
    expect(meetingSweep.config.cronTriggerSettings).toBeUndefined();
    expect(meetingSweep.config.databaseEventTriggerSettings).toBeUndefined();
  });
});

describe('meeting-sweep handler', () => {
  it('should read meetings from the last 25 hours to the next 48 hours in one query', async () => {
    setupQueryMock([]);

    await handler();

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0].calendarEvents.__args.filter).toEqual({
      and: [
        { startsAt: { gte: '2026-06-11T11:00:00.000Z' } },
        { startsAt: { lt: '2026-06-14T12:00:00.000Z' } },
        { isCanceled: { eq: false } },
      ],
    });
    expect(mutationMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('should apply started meetings and schedule upcoming ones', async () => {
    setupQueryMock([
      { id: 'past-event', startsAt: PAST_EVENT_STARTS_AT },
      { id: 'upcoming-event', startsAt: UPCOMING_EVENT_STARTS_AT },
    ]);

    await handler();

    const participantsCall = queryMock.mock.calls.find(
      ([query]) =>
        query.calendarEventParticipants &&
        !query.calendarEventParticipants.edges.node.calendarEvent,
    );
    expect(
      participantsCall?.[0].calendarEventParticipants.__args.filter,
    ).toEqual({
      calendarEventId: { in: ['past-event'] },
      personId: { is: 'NOT_NULL' },
    });

    const personUpserts = mutationMock.mock.calls.filter(
      ([mutation]) => mutation.createPeople,
    );
    expect(personUpserts).toHaveLength(1);
    expect(personUpserts[0][0].createPeople.__args.data[0]).toMatchObject({
      id: PERSON_ID,
      lastContactAt: PAST_EVENT_STARTS_AT,
      lastContactItemCalendarEventId: 'past-event',
    });

    expect(enqueueJobsMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobsMock.mock.calls[0][0].jobs).toEqual([
      {
        jobId: `meeting-slot-${Date.parse('2026-06-12T15:00:00.000Z')}`,
        payload: {
          slotStart: '2026-06-12T15:00:00.000Z',
          slotEnd: '2026-06-12T15:15:00.000Z',
        },
      },
    ]);
  });
});
