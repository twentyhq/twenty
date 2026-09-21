import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRelatedLastContactForPeople } from 'src/utils/update-related-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PERSON_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const OLDER_MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const CALENDAR_EVENT_ID = '66666666-6666-6666-6666-666666666666';
const COMPANY_ID = '33333333-3333-3333-3333-333333333333';
const OPPORTUNITY_ID = '77777777-7777-7777-7777-777777777777';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';
const OLDER_OCCURRED_AT = '2026-06-01T09:00:00.000Z';
const NEWER_OCCURRED_AT = '2026-06-20T09:00:00.000Z';

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
  companies = [{ id: COMPANY_ID, lastContactAt: null }],
  opportunities = [],
}: {
  people?: Record<string, unknown>[];
  companies?: Record<string, unknown>[];
  opportunities?: Record<string, unknown>[];
}): Client => ({
  query: vi.fn().mockImplementation((query) => {
    if (query.people) {
      return Promise.resolve({ people: buildPage(people) });
    }

    if (query.companies) {
      return Promise.resolve({ companies: buildPage(companies) });
    }

    return Promise.resolve({ opportunities: buildPage(opportunities) });
  }),
  mutation: vi.fn().mockResolvedValue({}),
});

let client: Client;

beforeEach(() => {
  client = buildClient({
    people: [{ id: PERSON_ID, companyId: COMPANY_ID }],
    opportunities: [
      {
        id: OPPORTUNITY_ID,
        pointOfContactId: PERSON_ID,
        lastContactAt: null,
      },
    ],
  });
});

const findUpsertData = (name: string) =>
  client.mutation.mock.calls.find((call) => call[0][name])?.[0][name].__args
    .data;

const emailContact = (occurredAt = OCCURRED_AT, itemId = MESSAGE_ID) =>
  new Map([[PERSON_ID, { occurredAt, itemId, kind: 'email' as const }]]);

describe('updateRelatedLastContactForPeople', () => {
  it('updates the company and point-of-contact opportunities for an email', async () => {
    await updateRelatedLastContactForPeople(client as never, emailContact());

    const expectedData = {
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    };

    expect(findUpsertData('createCompanies')).toEqual([
      { id: COMPANY_ID, ...expectedData },
    ]);
    expect(findUpsertData('createOpportunities')).toEqual([
      { id: OPPORTUNITY_ID, ...expectedData },
    ]);
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

    expect(findUpsertData('createCompanies')).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('leaves a company and an opportunity already contacted more recently alone', async () => {
    client = buildClient({
      people: [{ id: PERSON_ID, companyId: COMPANY_ID }],
      companies: [{ id: COMPANY_ID, lastContactAt: NEWER_OCCURRED_AT }],
      opportunities: [
        {
          id: OPPORTUNITY_ID,
          pointOfContactId: PERSON_ID,
          lastContactAt: NEWER_OCCURRED_AT,
        },
      ],
    });

    await updateRelatedLastContactForPeople(client as never, emailContact());

    expect(findUpsertData('createCompanies')).toBeUndefined();
    expect(findUpsertData('createOpportunities')).toBeUndefined();
  });

  it('skips the company update when the person has no company but still updates opportunities', async () => {
    client = buildClient({
      people: [{ id: PERSON_ID, companyId: null }],
      opportunities: [
        {
          id: OPPORTUNITY_ID,
          pointOfContactId: PERSON_ID,
          lastContactAt: null,
        },
      ],
    });

    await updateRelatedLastContactForPeople(client as never, emailContact());

    expect(findUpsertData('createCompanies')).toBeUndefined();
    expect(findUpsertData('createOpportunities')).toEqual([
      {
        id: OPPORTUNITY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    ]);
  });

  it('leaves out a company that no longer exists rather than upserting it back', async () => {
    client = buildClient({
      people: [{ id: PERSON_ID, companyId: COMPANY_ID }],
      companies: [],
    });

    await updateRelatedLastContactForPeople(client as never, emailContact());

    expect(findUpsertData('createCompanies')).toBeUndefined();
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

    expect(findUpsertData('createCompanies')).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    ]);
  });
});
