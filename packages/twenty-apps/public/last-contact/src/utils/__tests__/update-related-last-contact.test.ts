import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRelatedLastContactForPeople } from 'src/utils/update-related-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PERSON_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const OLDER_MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const CALENDAR_EVENT_ID = '66666666-6666-6666-6666-666666666666';
const COMPANY_ID = '33333333-3333-3333-3333-333333333333';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';
const OLDER_OCCURRED_AT = '2026-06-01T09:00:00.000Z';

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const buildClient = ({
  people = [],
  opportunities = [],
}: {
  people?: Record<string, unknown>[];
  opportunities?: Record<string, unknown>[];
}): Client => ({
  query: vi.fn().mockImplementation((query) =>
    query.people
      ? Promise.resolve({ people: buildPage(people) })
      : Promise.resolve({ opportunities: buildPage(opportunities) }),
  ),
  mutation: vi.fn().mockResolvedValue({}),
});

let client: Client;

beforeEach(() => {
  client = buildClient({
    people: [{ id: PERSON_ID, companyId: COMPANY_ID }],
    opportunities: [{ id: 'opportunity-1', pointOfContactId: PERSON_ID }],
  });
});

const findMutation = (name: string) =>
  client.mutation.mock.calls.find((call) => call[0][name])?.[0][name];

describe('updateRelatedLastContactForPeople', () => {
  it('updates the company and point-of-contact opportunities for an email', async () => {
    await updateRelatedLastContactForPeople(
      client as never,
      new Map([
        [
          PERSON_ID,
          { occurredAt: OCCURRED_AT, itemId: MESSAGE_ID, kind: 'email' as const },
        ],
      ]),
    );

    const expectedData = {
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    };
    expect(findMutation('updateCompanies').__args.data).toEqual(expectedData);
    expect(findMutation('updateCompanies').__args.filter.and[0]).toEqual({
      id: { eq: COMPANY_ID },
    });
    expect(findMutation('updateOpportunities').__args.data).toEqual(
      expectedData,
    );
    expect(findMutation('updateOpportunities').__args.filter.and[0]).toEqual({
      pointOfContactId: { eq: PERSON_ID },
    });
  });

  it('sets the calendar event item for a meeting', async () => {
    await updateRelatedLastContactForPeople(
      client as never,
      new Map([
        [
          PERSON_ID,
          {
            occurredAt: OCCURRED_AT,
            itemId: CALENDAR_EVENT_ID,
            kind: 'meeting' as const,
          },
        ],
      ]),
    );

    expect(findMutation('updateCompanies').__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
    });
  });

  it('only guards against newer contacts', async () => {
    await updateRelatedLastContactForPeople(
      client as never,
      new Map([
        [
          PERSON_ID,
          { occurredAt: OCCURRED_AT, itemId: MESSAGE_ID, kind: 'email' as const },
        ],
      ]),
    );

    const expectedGuard = {
      or: [
        { lastContactAt: { is: 'NULL' } },
        { lastContactAt: { lt: OCCURRED_AT } },
      ],
    };
    expect(findMutation('updateCompanies').__args.filter.and[1]).toEqual(
      expectedGuard,
    );
    expect(findMutation('updateOpportunities').__args.filter.and[1]).toEqual(
      expectedGuard,
    );
  });

  it('skips the company update when the person has no company but still updates opportunities', async () => {
    client = buildClient({
      people: [{ id: PERSON_ID, companyId: null }],
      opportunities: [{ id: 'opportunity-1', pointOfContactId: PERSON_ID }],
    });

    await updateRelatedLastContactForPeople(
      client as never,
      new Map([
        [
          PERSON_ID,
          { occurredAt: OCCURRED_AT, itemId: MESSAGE_ID, kind: 'email' as const },
        ],
      ]),
    );

    expect(findMutation('updateCompanies')).toBeUndefined();
    expect(findMutation('updateOpportunities').__args.filter.and[0]).toEqual({
      pointOfContactId: { eq: PERSON_ID },
    });
  });

  it('updates a shared company once, with the most recent contact of its people', async () => {
    client = buildClient({
      people: [
        { id: PERSON_ID, companyId: COMPANY_ID },
        { id: OTHER_PERSON_ID, companyId: COMPANY_ID },
      ],
    });

    await updateRelatedLastContactForPeople(
      client as never,
      new Map([
        [
          PERSON_ID,
          {
            occurredAt: OLDER_OCCURRED_AT,
            itemId: OLDER_MESSAGE_ID,
            kind: 'email' as const,
          },
        ],
        [
          OTHER_PERSON_ID,
          { occurredAt: OCCURRED_AT, itemId: MESSAGE_ID, kind: 'email' as const },
        ],
      ]),
    );

    const companyUpdates = client.mutation.mock.calls.filter(
      ([mutation]) => mutation.updateCompanies,
    );
    expect(companyUpdates).toHaveLength(1);
    expect(companyUpdates[0][0].updateCompanies.__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    });
  });
});
