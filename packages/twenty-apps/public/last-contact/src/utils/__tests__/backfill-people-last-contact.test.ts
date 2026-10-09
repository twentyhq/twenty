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
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';

const client = {
  query: vi.fn(),
  mutation: vi.fn().mockResolvedValue({}),
};

beforeEach(() => {
  client.mutation.mockClear();
  buildPersonAggregatesMock.mockReset();
});

describe('backfillPeopleLastContact', () => {
  it('writes every field of every person, clearing those no interaction supports', async () => {
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

    await backfillPeopleLastContact(client as never, [
      CONTACTED_PERSON_ID,
      UNCONTACTED_PERSON_ID,
    ]);

    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0][0].createPeople.__args).toEqual({
      upsert: true,
      data: [
        {
          id: CONTACTED_PERSON_ID,
          lastContactAt: RECEIVED_AT,
          lastContactById: MEMBER_ID,
          lastOutboundAt: RECEIVED_AT,
          lastInboundAt: null,
          lastEmailId: MESSAGE_ID,
          lastMeetingId: null,
          lastContactItemMessageId: MESSAGE_ID,
          lastContactItemCalendarEventId: null,
        },
        {
          id: UNCONTACTED_PERSON_ID,
          lastContactAt: null,
          lastContactById: null,
          lastOutboundAt: null,
          lastInboundAt: null,
          lastEmailId: null,
          lastMeetingId: null,
          lastContactItemMessageId: null,
          lastContactItemCalendarEventId: null,
        },
      ],
    });
  });
});
