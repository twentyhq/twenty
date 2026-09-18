import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_COMPANY_ID = '22222222-2222-2222-2222-222222222222';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';
const OLDER_OCCURRED_AT = '2026-06-01T09:00:00.000Z';

const EMPTY_LAST_CONTACT = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const buildPage = (
  nodes: Record<string, unknown>[],
  hasNextPage = false,
  endCursor: string | null = null,
) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage, endCursor },
});

const buildClient = ({
  peoplePages = [buildPage([])],
  existingCompanyIds = [COMPANY_ID, OTHER_COMPANY_ID],
}: {
  peoplePages?: ReturnType<typeof buildPage>[];
  existingCompanyIds?: string[];
}): Client => {
  let peopleCallIndex = 0;

  return {
    query: vi.fn().mockImplementation((query) => {
      if (query.companies) {
        return Promise.resolve({
          companies: buildPage(existingCompanyIds.map((id) => ({ id }))),
        });
      }

      const page = peoplePages[peopleCallIndex] ?? buildPage([]);

      peopleCallIndex += 1;

      return Promise.resolve({ people: page });
    }),
    mutation: vi.fn().mockResolvedValue({}),
  };
};

let client: Client;

beforeEach(() => {
  client = buildClient({});
});

const upsertData = () =>
  client.mutation.mock.calls[0]?.[0].createCompanies.__args.data;

const peopleQueries = () =>
  client.query.mock.calls.filter(([query]) => query.people);

describe('recomputeCompaniesLastContact', () => {
  it('mirrors the most recent contact among the company people', async () => {
    client = buildClient({
      peoplePages: [
        buildPage([
          {
            companyId: COMPANY_ID,
            lastContactAt: OCCURRED_AT,
            lastContactItemMessage: null,
            lastContactItemCalendarEvent: { id: CALENDAR_EVENT_ID },
          },
        ]),
      ],
      existingCompanyIds: [COMPANY_ID],
    });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(upsertData()).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('keeps the first row a company produces, since the scan is ordered by recency', async () => {
    client = buildClient({
      peoplePages: [
        buildPage([
          {
            companyId: COMPANY_ID,
            lastContactAt: OCCURRED_AT,
            lastContactItemMessage: { id: MESSAGE_ID },
            lastContactItemCalendarEvent: null,
          },
          {
            companyId: COMPANY_ID,
            lastContactAt: OLDER_OCCURRED_AT,
            lastContactItemMessage: null,
            lastContactItemCalendarEvent: { id: CALENDAR_EVENT_ID },
          },
        ]),
      ],
      existingCompanyIds: [COMPANY_ID],
    });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(upsertData()).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    ]);
  });

  it('clears the company last contact when no person has a contact', async () => {
    client = buildClient({ existingCompanyIds: [COMPANY_ID] });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(upsertData()).toEqual([{ id: COMPANY_ID, ...EMPTY_LAST_CONTACT }]);
  });

  it('resolves the whole batch with one scan and one write', async () => {
    client = buildClient({
      peoplePages: [
        buildPage([
          {
            companyId: COMPANY_ID,
            lastContactAt: OCCURRED_AT,
            lastContactItemMessage: { id: MESSAGE_ID },
            lastContactItemCalendarEvent: null,
          },
        ]),
      ],
    });

    await recomputeCompaniesLastContact(client as never, [
      COMPANY_ID,
      OTHER_COMPANY_ID,
    ]);

    expect(peopleQueries()).toHaveLength(1);
    expect(peopleQueries()[0][0].people.__args.filter).toEqual({
      companyId: { in: [COMPANY_ID, OTHER_COMPANY_ID] },
      lastContactAt: { is: 'NOT_NULL' },
    });
    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(upsertData()).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
      { id: OTHER_COMPANY_ID, ...EMPTY_LAST_CONTACT },
    ]);
  });

  it('stops scanning as soon as every company is resolved', async () => {
    client = buildClient({
      peoplePages: [
        buildPage(
          [
            {
              companyId: COMPANY_ID,
              lastContactAt: OCCURRED_AT,
              lastContactItemMessage: { id: MESSAGE_ID },
              lastContactItemCalendarEvent: null,
            },
            {
              companyId: OTHER_COMPANY_ID,
              lastContactAt: OLDER_OCCURRED_AT,
              lastContactItemMessage: { id: MESSAGE_ID },
              lastContactItemCalendarEvent: null,
            },
          ],
          true,
          'cursor-1',
        ),
      ],
    });

    await recomputeCompaniesLastContact(client as never, [
      COMPANY_ID,
      OTHER_COMPANY_ID,
    ]);

    expect(peopleQueries()).toHaveLength(1);
  });

  it('falls back to a direct lookup for a company the capped scan never reached', async () => {
    const busyCompanyPage = buildPage(
      [
        {
          companyId: COMPANY_ID,
          lastContactAt: OCCURRED_AT,
          lastContactItemMessage: { id: MESSAGE_ID },
          lastContactItemCalendarEvent: null,
        },
      ],
      true,
      'cursor',
    );

    client = buildClient({
      peoplePages: [
        busyCompanyPage,
        busyCompanyPage,
        busyCompanyPage,
        busyCompanyPage,
        busyCompanyPage,
        buildPage([
          {
            companyId: OTHER_COMPANY_ID,
            lastContactAt: OLDER_OCCURRED_AT,
            lastContactItemMessage: null,
            lastContactItemCalendarEvent: { id: CALENDAR_EVENT_ID },
          },
        ]),
      ],
    });

    await recomputeCompaniesLastContact(client as never, [
      COMPANY_ID,
      OTHER_COMPANY_ID,
    ]);

    expect(peopleQueries()).toHaveLength(6);
    expect(peopleQueries()[5][0].people.__args.filter).toEqual({
      companyId: { eq: OTHER_COMPANY_ID },
      lastContactAt: { is: 'NOT_NULL' },
    });
    expect(upsertData()).toEqual([
      {
        id: COMPANY_ID,
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
      {
        id: OTHER_COMPANY_ID,
        lastContactAt: OLDER_OCCURRED_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      },
    ]);
  });

  it('leaves out a company that no longer exists rather than upserting it back', async () => {
    client = buildClient({ existingCompanyIds: [] });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(client.mutation).not.toHaveBeenCalled();
  });
});
