import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type PersonLastContactState } from 'src/utils/update-person-last-contact';
import { updateRelatedLastContactForPeople } from 'src/utils/update-related-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PERSON_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const OLDER_MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const CALENDAR_EVENT_ID = '66666666-6666-6666-6666-666666666666';
const COMPANY_ID = '33333333-3333-3333-3333-333333333333';
const OPPORTUNITY_ID = '77777777-7777-7777-7777-777777777777';
const OTHER_OPPORTUNITY_ID = '88888888-8888-8888-8888-888888888888';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';
const OLDER_OCCURRED_AT = '2026-06-01T09:00:00.000Z';
const NEWER_OCCURRED_AT = '2026-06-20T09:00:00.000Z';

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const buildState = ({
  company = { id: COMPANY_ID, lastContactAt: null },
  opportunities = [{ id: OPPORTUNITY_ID, lastContactAt: null }],
  totalCount = opportunities.length,
}: {
  company?: { id: string; lastContactAt: string | null } | null;
  opportunities?: { id: string; lastContactAt: string | null }[];
  totalCount?: number | null;
} = {}): PersonLastContactState => ({
  company,
  pointOfContactForOpportunities: {
    totalCount,
    edges: opportunities.map((node) => ({ node })),
  },
});

let client: Client;

beforeEach(() => {
  client = {
    query: vi.fn(),
    mutation: vi.fn().mockResolvedValue({}),
  };
});

const findUpsertData = (name: string) =>
  client.mutation.mock.calls.find((call) => call[0][name])?.[0][name].__args
    .data;

const emailContact = (occurredAt = OCCURRED_AT, itemId = MESSAGE_ID) =>
  new Map([[PERSON_ID, { occurredAt, itemId, kind: 'email' as const }]]);

const stateFor = (state: PersonLastContactState) =>
  new Map([[PERSON_ID, state]]);

describe('updateRelatedLastContactForPeople', () => {
  it('updates the company and point-of-contact opportunities without reading them again', async () => {
    await updateRelatedLastContactForPeople(
      client as never,
      emailContact(),
      stateFor(buildState()),
    );

    const expectedData = {
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    };

    expect(client.query).not.toHaveBeenCalled();
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
      stateFor(buildState()),
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
    await updateRelatedLastContactForPeople(
      client as never,
      emailContact(),
      stateFor(
        buildState({
          company: { id: COMPANY_ID, lastContactAt: NEWER_OCCURRED_AT },
          opportunities: [
            { id: OPPORTUNITY_ID, lastContactAt: NEWER_OCCURRED_AT },
          ],
        }),
      ),
    );

    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('skips the company update when the person has no company but still updates opportunities', async () => {
    await updateRelatedLastContactForPeople(
      client as never,
      emailContact(),
      stateFor(buildState({ company: null })),
    );

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

  it('updates a shared company once, with the most recent contact of its people', async () => {
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
      new Map([
        [PERSON_ID, buildState({ opportunities: [] })],
        [OTHER_PERSON_ID, buildState({ opportunities: [] })],
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

  it('reads the opportunities of a person past the nested relation cap', async () => {
    client.query.mockResolvedValue({
      opportunities: {
        edges: [
          {
            node: {
              id: OPPORTUNITY_ID,
              pointOfContactId: PERSON_ID,
              lastContactAt: null,
            },
          },
          {
            node: {
              id: OTHER_OPPORTUNITY_ID,
              pointOfContactId: PERSON_ID,
              lastContactAt: null,
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    await updateRelatedLastContactForPeople(
      client as never,
      emailContact(),
      stateFor(buildState({ totalCount: 61 })),
    );

    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query.mock.calls[0][0].opportunities.__args.filter).toEqual({
      pointOfContactId: { in: [PERSON_ID] },
    });
    expect(
      findUpsertData('createOpportunities').map(({ id }: { id: string }) => id),
    ).toEqual([OPPORTUNITY_ID, OTHER_OPPORTUNITY_ID]);
  });

  it.each([null, 60])(
    'reads the opportunities of a person when the nested relation is full and its total count is %s',
    async (totalCount) => {
    client.query.mockResolvedValue({
      opportunities: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    await updateRelatedLastContactForPeople(
      client as never,
      emailContact(),
      stateFor(
        buildState({
          opportunities: Array.from({ length: 60 }, (_, index) => ({
            id: `opportunity-${index}`,
            lastContactAt: null,
          })),
          totalCount,
        }),
      ),
    );

    expect(client.query).toHaveBeenCalledTimes(1);
  },
  );
});
