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

const setupQueryMock = ({
  calendarEventsPages,
  participantsPages,
}: {
  calendarEventsPages: Page[];
  participantsPages: Page[];
}) => {
  const remainingEventsPages = [...calendarEventsPages];
  const remainingParticipantsPages = [...participantsPages];

  queryMock.mockImplementation((query) => {
    if (query.calendarEvents) {
      return Promise.resolve({ calendarEvents: remainingEventsPages.shift() });
    }

    if (query.person) {
      return Promise.resolve({ person: null });
    }

    const filter = query.calendarEventParticipants.__args.filter;

    if (filter.calendarEventId && filter.workspaceMemberId) {
      return Promise.resolve({
        calendarEventParticipants: { edges: [] },
      });
    }

    if (filter.calendarEventId) {
      return Promise.resolve({
        calendarEventParticipants: remainingParticipantsPages.shift(),
      });
    }

    return Promise.resolve({
      calendarEventParticipants: {
        edges: [
          {
            node: {
              id: 'participant-latest',
              calendarEvent: {
                id: 'event-latest',
                startsAt: PAST_EVENT_STARTS_AT,
              },
            },
          },
        ],
      },
    });
  });
};

const singlePage = (nodes: Record<string, unknown>[]): Page => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
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
    expect(calendarEventsCalls[0][0].calendarEvents.__args.after).toBeUndefined();
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
            { node: { id: 'participant-1', personId: PERSON_ID_1 } },
            { node: { id: 'participant-2', personId: null } },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'participants-cursor-1' },
        },
        singlePage([
          { id: 'participant-3', personId: PERSON_ID_1 },
          { id: 'participant-4', personId: PERSON_ID_2 },
        ]),
      ],
    });

    await handler();

    const participantsByEventCalls = queryMock.mock.calls.filter(
      ([query]) =>
        query.calendarEventParticipants?.__args.filter.calendarEventId &&
        !query.calendarEventParticipants?.__args.filter.workspaceMemberId,
    );
    expect(participantsByEventCalls).toHaveLength(2);
    expect(
      participantsByEventCalls[1][0].calendarEventParticipants.__args.after,
    ).toBe('participants-cursor-1');

    const perPersonCalls = queryMock.mock.calls.filter(
      ([query]) => query.calendarEventParticipants?.__args.filter.personId,
    );
    expect(
      perPersonCalls.map(
        ([query]) =>
          query.calendarEventParticipants.__args.filter.personId.eq,
      ),
    ).toEqual([PERSON_ID_1, PERSON_ID_2]);
    expect(
      mutationMock.mock.calls.filter(([mutation]) => mutation.updatePeople),
    ).toHaveLength(2);
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
