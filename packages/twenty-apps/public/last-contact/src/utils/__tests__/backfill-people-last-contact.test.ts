import { beforeEach, describe, expect, it, vi } from 'vitest';

const { buildPersonAggregatesMock } = vi.hoisted(() => ({
  buildPersonAggregatesMock: vi.fn(),
}));

vi.mock('src/utils/person-last-contact-aggregation', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  buildPersonAggregates: buildPersonAggregatesMock,
}));

import { backfillPeopleLastContact } from 'src/utils/backfill-people-last-contact';

const CONTACTED_PERSON_ID = '11111111-1111-1111-1111-111111111111';
const UNCONTACTED_PERSON_ID = '22222222-2222-2222-2222-222222222222';
const MESSAGE_ID = '33333333-3333-3333-3333-333333333333';
const MEMBER_ID = '44444444-4444-4444-4444-444444444444';
const STALE_MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';
const STALE_RECEIVED_AT = '2026-01-01T09:00:00.000Z';

const CONTACTED_PERSON_DATA = {
  lastContactAt: RECEIVED_AT,
  lastContactById: MEMBER_ID,
  lastOutboundAt: RECEIVED_AT,
  lastInboundAt: null,
  lastEmailId: MESSAGE_ID,
  lastMeetingId: null,
  lastContactItemMessageId: MESSAGE_ID,
  lastContactItemCalendarEventId: null,
};

const EMPTY_PERSON_DATA = {
  lastContactAt: null,
  lastContactById: null,
  lastOutboundAt: null,
  lastInboundAt: null,
  lastEmailId: null,
  lastMeetingId: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

const STALE_PERSON_DATA = {
  ...EMPTY_PERSON_DATA,
  lastContactAt: STALE_RECEIVED_AT,
  lastInboundAt: STALE_RECEIVED_AT,
  lastEmailId: STALE_MESSAGE_ID,
  lastContactItemMessageId: STALE_MESSAGE_ID,
};

const client = {
  query: vi.fn(),
  mutation: vi.fn().mockResolvedValue({}),
};

const mockCurrentPeople = (people: Record<string, unknown>[]) =>
  client.query.mockResolvedValue({
    people: {
      edges: people.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  });

const upsertedPeople = () =>
  client.mutation.mock.calls[0]?.[0].createPeople.__args.data;

beforeEach(() => {
  client.query.mockReset();
  client.mutation.mockClear();
  buildPersonAggregatesMock.mockReset();
  buildPersonAggregatesMock.mockResolvedValue(
    new Map([
      [
        CONTACTED_PERSON_ID,
        {
          lastContactAt: RECEIVED_AT,
          lastContactById: MEMBER_ID,
          item: { kind: 'email', id: MESSAGE_ID },
          lastOutboundAt: RECEIVED_AT,
          lastEmail: { at: RECEIVED_AT, id: MESSAGE_ID },
        },
      ],
    ]),
  );
});

describe('backfillPeopleLastContact', () => {
  it('writes every field of every person, clearing those no interaction supports', async () => {
    mockCurrentPeople([
      { id: CONTACTED_PERSON_ID, ...STALE_PERSON_DATA },
      { id: UNCONTACTED_PERSON_ID, ...STALE_PERSON_DATA },
    ]);

    await backfillPeopleLastContact(client as never, [
      CONTACTED_PERSON_ID,
      UNCONTACTED_PERSON_ID,
    ]);

    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0][0].createPeople.__args).toEqual({
      upsert: true,
      data: [
        { id: CONTACTED_PERSON_ID, ...CONTACTED_PERSON_DATA },
        { id: UNCONTACTED_PERSON_ID, ...EMPTY_PERSON_DATA },
      ],
    });
  });

  it('leaves out a person deleted since the batch was listed rather than upserting it back', async () => {
    mockCurrentPeople([{ id: UNCONTACTED_PERSON_ID, ...STALE_PERSON_DATA }]);

    await backfillPeopleLastContact(client as never, [
      CONTACTED_PERSON_ID,
      UNCONTACTED_PERSON_ID,
    ]);

    expect(upsertedPeople()).toEqual([
      { id: UNCONTACTED_PERSON_ID, ...EMPTY_PERSON_DATA },
    ]);
  });

  it('reads the people after aggregating their interactions, right before the write', async () => {
    mockCurrentPeople([{ id: CONTACTED_PERSON_ID, ...STALE_PERSON_DATA }]);

    await backfillPeopleLastContact(client as never, [CONTACTED_PERSON_ID]);

    expect(buildPersonAggregatesMock.mock.invocationCallOrder[0]).toBeLessThan(
      client.query.mock.invocationCallOrder[0],
    );
    expect(client.query.mock.invocationCallOrder[0]).toBeLessThan(
      client.mutation.mock.invocationCallOrder[0],
    );
  });

  it('leaves out a person whose last contact already matches', async () => {
    mockCurrentPeople([
      {
        id: CONTACTED_PERSON_ID,
        ...CONTACTED_PERSON_DATA,
        lastContactAt: '2026-06-10T09:00:00Z',
      },
      { id: UNCONTACTED_PERSON_ID, ...STALE_PERSON_DATA },
    ]);

    await backfillPeopleLastContact(client as never, [
      CONTACTED_PERSON_ID,
      UNCONTACTED_PERSON_ID,
    ]);

    expect(upsertedPeople()).toEqual([
      { id: UNCONTACTED_PERSON_ID, ...EMPTY_PERSON_DATA },
    ]);
  });

  it('skips the write when no person changes', async () => {
    mockCurrentPeople([{ id: UNCONTACTED_PERSON_ID, ...EMPTY_PERSON_DATA }]);

    await backfillPeopleLastContact(client as never, [UNCONTACTED_PERSON_ID]);

    expect(client.mutation).not.toHaveBeenCalled();
  });
});
