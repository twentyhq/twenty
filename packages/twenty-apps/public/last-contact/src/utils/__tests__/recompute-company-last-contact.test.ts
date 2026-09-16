import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_COMPANY_ID = '22222222-2222-2222-2222-222222222222';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '55555555-5555-5555-5555-555555555555';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

const EMPTY_LAST_CONTACT = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const buildGroup = (companyId: string, person: Record<string, unknown>) => ({
  groupByDimensionValues: [companyId],
  edges: [{ node: person }],
});

const buildClient = ({
  groups = [],
  existingCompanyIds = [COMPANY_ID, OTHER_COMPANY_ID],
}: {
  groups?: Record<string, unknown>[];
  existingCompanyIds?: string[];
}): Client => ({
  query: vi.fn().mockImplementation((query) =>
    query.peopleGroupBy
      ? Promise.resolve({ peopleGroupBy: groups })
      : Promise.resolve({
          companies: {
            edges: existingCompanyIds.map((id) => ({ node: { id } })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }),
  ),
  mutation: vi.fn().mockResolvedValue({}),
});

let client: Client;

beforeEach(() => {
  client = buildClient({});
});

const upsertData = () =>
  client.mutation.mock.calls[0]?.[0].createCompanies.__args.data;

describe('recomputeCompaniesLastContact', () => {
  it('mirrors the most recent contact among the company people', async () => {
    client = buildClient({
      groups: [
        buildGroup(COMPANY_ID, {
          lastContactAt: OCCURRED_AT,
          lastContactItemMessage: null,
          lastContactItemCalendarEvent: { id: CALENDAR_EVENT_ID },
        }),
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

  it('clears the company last contact when no person has a contact', async () => {
    client = buildClient({ groups: [], existingCompanyIds: [COMPANY_ID] });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(upsertData()).toEqual([{ id: COMPANY_ID, ...EMPTY_LAST_CONTACT }]);
  });

  it('groups the whole batch into one query and one write', async () => {
    client = buildClient({
      groups: [
        buildGroup(COMPANY_ID, {
          lastContactAt: OCCURRED_AT,
          lastContactItemMessage: { id: MESSAGE_ID },
          lastContactItemCalendarEvent: null,
        }),
      ],
    });

    await recomputeCompaniesLastContact(client as never, [
      COMPANY_ID,
      OTHER_COMPANY_ID,
    ]);

    const groupByCall = client.query.mock.calls.find(
      ([query]) => query.peopleGroupBy,
    )?.[0].peopleGroupBy;

    expect(groupByCall.__args.groupBy).toEqual([{ company: { id: true } }]);
    expect(groupByCall.__args.filter).toEqual({
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

  it('leaves out a company that no longer exists rather than upserting it back', async () => {
    client = buildClient({ groups: [], existingCompanyIds: [] });

    await recomputeCompaniesLastContact(client as never, [COMPANY_ID]);

    expect(client.mutation).not.toHaveBeenCalled();
  });
});
