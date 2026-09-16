import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onCalendarEventStarted from '../on-calendar-event-started';

const PERSON_ID_1 = '11111111-1111-1111-1111-111111111111';
const PERSON_ID_2 = '22222222-2222-2222-2222-222222222222';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const handler = onCalendarEventStarted.config.handler as () => Promise<void>;

type Page = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const singlePage = (nodes: Record<string, unknown>[]): Page => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const setupQueryMock = ({
  calendarEventsPages,
  participantsPages,
  startedParticipants = [],
}: {
  calendarEventsPages: Page[];
  participantsPages: Page[];
  startedParticipants?: Record<string, unknown>[];
}) => {
  const remainingEventsPages = [...calendarEventsPages];
  const remainingParticipantsPages = [...participantsPages];

  queryMock.mockImplementation((query) => {
    if (query.calendarEvents) {
      return Promise.resolve({ calendarEvents: remainingEventsPages.shift() });
    }

    if (query.calendarEventParticipants) {
      return Promise.resolve({
        calendarEventParticipants: query.calendarEventParticipants.edges.node
          .calendarEvent
          ? singlePage(startedParticipants)
          : remainingParticipantsPages.shift(),
      });
    }

    if (query.person) {
      return Promise.resolve({ person: null });
    }

    if (query.people) {
      const requestedIds: string[] = query.people.__args.filter.id.in;

      // The company resolve and the last-contact state read both query people;
      // only the former selects companyId.
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
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-calendar-event-started definition', () => {
  it('should be valid and run on a cron schedule', () => {
    expect(onCalendarEventStarted.success).toBe(true);
    expect(onCalendarEventStarted.config.cronTriggerSettings).toEqual({
      pattern: '*/5 * * * *',
    });
  });
});

describe('on-calendar-event-started handler', () => {
  it('should paginate calendar events past the query record cap', async () => {
    setupQueryMock({
      calendarEventsPages: [
        {
          edges: [{ node: { id: 'event-1' } }],
          pageInfo: { hasNextPage: true, endCursor: 'events-cursor-1' },
        },
        singlePage([{ id: 'event-2' }]),
      ],
      participantsPages: [singlePage([])],
    });

    await handler();

    const calendarEventsCalls = queryMock.mock.calls.filter(
      ([query]) => query.calendarEvents,
    );
    expect(calendarEventsCalls).toHaveLength(2);
    expect(calendarEventsCalls[0][0].calendarEvents.__args.first).toBe(200);
    expect(
      calendarEventsCalls[0][0].calendarEvents.__args.after,
    ).toBeUndefined();
    expect(calendarEventsCalls[1][0].calendarEvents.__args.after).toBe(
      'events-cursor-1',
    );

    const participantsCall = queryMock.mock.calls.find(
      ([query]) =>
        query.calendarEventParticipants?.__args.filter.calendarEventId,
    );
    expect(
      participantsCall?.[0].calendarEventParticipants.__args.filter
        .calendarEventId,
    ).toEqual({ in: ['event-1', 'event-2'] });
  });

  it('should paginate participants and update each person once', async () => {
    setupQueryMock({
      calendarEventsPages: [singlePage([{ id: 'event-1' }])],
      participantsPages: [
        {
          edges: [
            { node: { personId: PERSON_ID_1, calendarEventId: 'event-1' } },
            { node: { personId: null, calendarEventId: 'event-1' } },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'participants-cursor-1' },
        },
        singlePage([
          { personId: PERSON_ID_1, calendarEventId: 'event-1' },
          { personId: PERSON_ID_2, calendarEventId: 'event-1' },
        ]),
      ],
      startedParticipants: [
        {
          calendarEventId: 'event-1',
          isOrganizer: null,
          workspaceMemberId: null,
          calendarEvent: {
            startsAt: PAST_EVENT_STARTS_AT,
            isCanceled: false,
          },
        },
      ],
    });

    await handler();

    const participantsByEventCalls = queryMock.mock.calls.filter(
      ([query]) =>
        query.calendarEventParticipants?.__args.filter.calendarEventId &&
        !query.calendarEventParticipants?.edges.node.calendarEvent,
    );
    expect(participantsByEventCalls).toHaveLength(2);
    expect(
      participantsByEventCalls[1][0].calendarEventParticipants.__args.after,
    ).toBe('participants-cursor-1');

    const personUpserts = mutationMock.mock.calls.filter(
      ([mutation]) => mutation.createPeople,
    );
    expect(personUpserts).toHaveLength(1);
    expect(personUpserts[0][0].createPeople.__args.data).toHaveLength(2);
    expect(personUpserts[0][0].createPeople.__args.data[0]).toMatchObject({
      lastContactAt: PAST_EVENT_STARTS_AT,
      lastContactItemCalendarEventId: 'event-1',
    });
  });

  it('should do nothing when no event started in the time window', async () => {
    setupQueryMock({
      calendarEventsPages: [singlePage([])],
      participantsPages: [],
    });

    await handler();

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
