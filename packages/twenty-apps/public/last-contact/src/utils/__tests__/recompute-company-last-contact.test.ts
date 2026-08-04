import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recomputeCompanyLastContact } from 'src/utils/recompute-company-last-contact';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

let client: Client;

beforeEach(() => {
  client = {
    query: vi.fn(),
    mutation: vi.fn().mockResolvedValue({}),
  };
});

describe('recomputeCompanyLastContact', () => {
  it('mirrors the most recent contact among the company people', async () => {
    client.query.mockResolvedValueOnce({
      people: {
        edges: [
          {
            node: {
              lastContactAt: OCCURRED_AT,
              lastContactItemMessage: null,
              lastContactItemCalendarEvent: { id: CALENDAR_EVENT_ID },
            },
          },
        ],
      },
    });

    await recomputeCompanyLastContact(client as never, COMPANY_ID);

    const args = client.mutation.mock.calls[0][0].updateCompany.__args;
    expect(args.id).toBe(COMPANY_ID);
    expect(args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
    });
    expect(client.query.mock.calls[0][0].people.__args.filter).toEqual({
      companyId: { eq: COMPANY_ID },
      lastContactAt: { is: 'NOT_NULL' },
    });
  });

  it('clears the company last contact when no person has a contact', async () => {
    client.query.mockResolvedValueOnce({ people: { edges: [] } });

    await recomputeCompanyLastContact(client as never, COMPANY_ID);

    expect(client.mutation.mock.calls[0][0].updateCompany.__args.data).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });
});
