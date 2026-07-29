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

import backfillLastContact from '../backfill-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PERSON_ID = '11111111-1111-1111-1111-111111111112';
const COMPANY_ID = '22222222-2222-2222-2222-222222222222';
const OPPORTUNITY_ID = '33333333-3333-3333-3333-333333333333';
const MESSAGE_ID = '44444444-4444-4444-4444-444444444444';
const CALENDAR_EVENT_ID = '55555555-5555-5555-5555-555555555555';
const MEMBER_ID = '66666666-6666-6666-6666-666666666666';

const RECEIVED_AT = '2026-06-10T09:00:00.000Z';
const STARTS_AT = '2026-06-11T09:00:00.000Z';

const handler = backfillLastContact.config.handler as () => Promise<void>;

const emptySnapshot = {
  companyId: null,
  lastContactAt: null,
  lastContactById: null,
  lastOutboundAt: null,
  lastInboundAt: null,
  lastEmailId: null,
  lastMeetingId: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

const connection = (nodes: unknown[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const mockWorkspace = ({
  messageParticipants = [],
  calendarEventParticipants = [],
  opportunities = [],
}: {
  messageParticipants?: unknown[];
  calendarEventParticipants?: unknown[];
  opportunities?: unknown[];
}) => {
  queryMock.mockImplementation(async (query: Record<string, unknown>) => {
    if ('messageParticipants' in query) {
      return { messageParticipants: connection(messageParticipants) };
    }
    if ('calendarEventParticipants' in query) {
      return {
        calendarEventParticipants: connection(calendarEventParticipants),
      };
    }
    if ('opportunities' in query) {
      return { opportunities: connection(opportunities) };
    }
    throw new Error(`Unexpected query: ${Object.keys(query).join(', ')}`);
  });
};

const upsertedData = (mutationName: string): Record<string, unknown>[] =>
  mutationMock.mock.calls
    .map(([mutation]) => mutation[mutationName])
    .filter(Boolean)
    .flatMap((mutation) => mutation.__args.data);

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('backfill-last-contact definition', () => {
  it('should be valid and re-run on version upgrades', () => {
    expect(backfillLastContact.success).toBe(true);
    expect(backfillLastContact.config.shouldRunOnVersionUpgrade).toBe(true);
  });
});

describe('backfill-last-contact handler', () => {
  it('derives the sender from the same participant page it reads person links from', async () => {
    mockWorkspace({
      messageParticipants: [
        {
          personId: null,
          role: 'FROM',
          workspaceMemberId: MEMBER_ID,
          message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
          person: null,
        },
        {
          personId: PERSON_ID,
          role: 'TO',
          workspaceMemberId: null,
          message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
          person: { id: PERSON_ID, ...emptySnapshot },
        },
      ],
    });

    await handler();

    expect(
      queryMock.mock.calls.every(
        ([query]) => !('people' in query) && !('messages' in query),
      ),
    ).toBe(true);
    expect(upsertedData('createPeople')).toEqual([
      {
        id: PERSON_ID,
        lastContactAt: RECEIVED_AT,
        lastContactById: MEMBER_ID,
        lastOutboundAt: RECEIVED_AT,
        lastEmailId: MESSAGE_ID,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    ]);
  });

  it('upserts people, companies and opportunities in one call each', async () => {
    mockWorkspace({
      messageParticipants: [
        {
          personId: PERSON_ID,
          role: 'FROM',
          workspaceMemberId: null,
          message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
          person: { id: PERSON_ID, ...emptySnapshot, companyId: COMPANY_ID },
        },
      ],
      calendarEventParticipants: [
        {
          personId: PERSON_ID,
          isOrganizer: true,
          workspaceMemberId: MEMBER_ID,
          calendarEvent: {
            id: CALENDAR_EVENT_ID,
            startsAt: STARTS_AT,
            isCanceled: false,
          },
          person: { id: PERSON_ID, ...emptySnapshot, companyId: COMPANY_ID },
        },
      ],
      opportunities: [
        {
          id: OPPORTUNITY_ID,
          pointOfContactId: PERSON_ID,
          lastContactAt: null,
          lastContactItemMessageId: null,
          lastContactItemCalendarEventId: null,
        },
      ],
    });

    await handler();

    expect(mutationMock).toHaveBeenCalledTimes(3);
    expect(upsertedData('createPeople')).toEqual([
      {
        id: PERSON_ID,
        lastContactAt: STARTS_AT,
        lastContactById: MEMBER_ID,
        lastOutboundAt: STARTS_AT,
        lastInboundAt: STARTS_AT,
        lastEmailId: MESSAGE_ID,
        lastMeetingId: CALENDAR_EVENT_ID,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
        lastContactItemMessageId: null,
      },
    ]);
    expect(upsertedData('createCompanies')).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: STARTS_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
    expect(upsertedData('createOpportunities')).toEqual([
      {
        id: OPPORTUNITY_ID,
        lastContactAt: STARTS_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('skips records that already hold the value it would write', async () => {
    mockWorkspace({
      messageParticipants: [
        {
          personId: PERSON_ID,
          role: 'FROM',
          workspaceMemberId: null,
          message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
          person: {
            id: PERSON_ID,
            ...emptySnapshot,
            lastContactAt: RECEIVED_AT,
            lastInboundAt: RECEIVED_AT,
            lastEmailId: MESSAGE_ID,
            lastContactItemMessageId: MESSAGE_ID,
          },
        },
        {
          personId: OTHER_PERSON_ID,
          role: 'TO',
          workspaceMemberId: null,
          message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
          person: { id: OTHER_PERSON_ID, ...emptySnapshot },
        },
      ],
      opportunities: [
        {
          id: OPPORTUNITY_ID,
          pointOfContactId: PERSON_ID,
          lastContactAt: RECEIVED_AT,
          lastContactItemMessageId: MESSAGE_ID,
          lastContactItemCalendarEventId: null,
        },
      ],
    });

    await handler();

    expect(upsertedData('createPeople').map((data) => data.id)).toEqual([
      OTHER_PERSON_ID,
    ]);
    expect(upsertedData('createOpportunities')).toEqual([]);
  });

  it('ignores canceled and future calendar events', async () => {
    mockWorkspace({
      calendarEventParticipants: [
        {
          personId: PERSON_ID,
          isOrganizer: true,
          workspaceMemberId: MEMBER_ID,
          calendarEvent: {
            id: CALENDAR_EVENT_ID,
            startsAt: STARTS_AT,
            isCanceled: true,
          },
          person: { id: PERSON_ID, ...emptySnapshot },
        },
        {
          personId: OTHER_PERSON_ID,
          isOrganizer: true,
          workspaceMemberId: MEMBER_ID,
          calendarEvent: {
            id: CALENDAR_EVENT_ID,
            startsAt: '2999-01-01T00:00:00.000Z',
            isCanceled: false,
          },
          person: { id: OTHER_PERSON_ID, ...emptySnapshot },
        },
      ],
    });

    await handler();

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
