import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onCalendarInteraction from '../on-calendar-interaction';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const CALENDAR_EVENT_ID = '22222222-2222-2222-2222-222222222222';
const NOW = '2026-06-12T12:00:00.000Z';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';

const handler = onCalendarInteraction.config.handler as (
  batch: unknown,
) => Promise<void>;

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const buildBatch = (
  participants: {
    personId: string | null;
    calendarEventId: string | null;
  }[],
) => ({
  name: 'calendarEventParticipant.updated',
  events: participants.map(({ personId, calendarEventId }, index) => ({
    recordId: `participant-${index}`,
    properties: {
      updatedFields: ['personId'],
      after: { id: `participant-${index}`, personId, calendarEventId },
    },
  })),
});

const setupQueryMock = (participants: Record<string, unknown>[]) => {
  queryMock.mockImplementation((query) => {
    if (query.calendarEventParticipants) {
      return Promise.resolve({
        calendarEventParticipants: buildPage(participants),
      });
    }

    if (query.person) {
      return Promise.resolve({ person: null });
    }

    if (query.people) {
      const requestedIds: string[] = query.people.__args.filter.id.in;
      return Promise.resolve({
        people: buildPage(
          query.people.edges.node.companyId
            ? requestedIds.map((id) => ({ id, companyId: null }))
            : requestedIds.map((id) => ({ id })),
        ),
      });
    }

    if (query.companies) {
      return Promise.resolve({ companies: buildPage([]) });
    }

    return Promise.resolve({ opportunities: buildPage([]) });
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

afterEach(() => {
  vi.useRealTimers();
});

describe('on-calendar-interaction definition', () => {
  it('should be valid and batch personId updates', () => {
    expect(onCalendarInteraction.success).toBe(true);
    expect(onCalendarInteraction.config.databaseEventTriggerSettings).toEqual({
      eventName: 'calendarEventParticipant.updated',
      updatedFields: ['personId'],
      batchMode: true,
    });
  });
});

describe('on-calendar-interaction handler', () => {
  it('updates the person from the calendar event carried by the participant', async () => {
    setupQueryMock([
      {
        calendarEventId: CALENDAR_EVENT_ID,
        isOrganizer: null,
        workspaceMemberId: null,
        calendarEvent: {
          startsAt: PAST_EVENT_STARTS_AT,
          isCanceled: false,
        },
      },
    ]);

    await handler(
      buildBatch([
        { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
      ]),
    );

    expect(
      queryMock.mock.calls[0][0].calendarEventParticipants.__args.filter,
    ).toEqual({ calendarEventId: { in: [CALENDAR_EVENT_ID] } });
    expect(mutationMock.mock.calls[0][0].createPeople.__args.data).toEqual([
      {
        id: PERSON_ID,
        lastContactAt: PAST_EVENT_STARTS_AT,
        lastContactById: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
        lastContactItemMessageId: null,
        lastOutboundAt: PAST_EVENT_STARTS_AT,
        lastInboundAt: PAST_EVENT_STARTS_AT,
        lastMeetingId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('should do nothing when no participant has both a person and a calendar event', async () => {
    await handler(
      buildBatch([
        { personId: null, calendarEventId: CALENDAR_EVENT_ID },
        { personId: PERSON_ID, calendarEventId: null },
      ]),
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
