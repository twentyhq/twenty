import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recomputeOpportunityLastContact } from 'src/utils/recompute-opportunity-last-contact';

const OPPORTUNITY_ID = '11111111-1111-1111-1111-111111111111';
const PERSON_ID = '22222222-2222-2222-2222-222222222222';
const MESSAGE_ID = '33333333-3333-3333-3333-333333333333';
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

describe('recomputeOpportunityLastContact', () => {
  it('mirrors the point of contact last contact onto the opportunity', async () => {
    client.query
      .mockResolvedValueOnce({
        opportunity: { id: OPPORTUNITY_ID, pointOfContactId: PERSON_ID },
      })
      .mockResolvedValueOnce({
        person: {
          id: PERSON_ID,
          lastContactAt: OCCURRED_AT,
          lastContactItemMessage: { id: MESSAGE_ID },
          lastContactItemCalendarEvent: null,
        },
      });

    await recomputeOpportunityLastContact(client as never, OPPORTUNITY_ID);

    expect(client.mutation.mock.calls[0][0].updateOpportunity.__args).toEqual({
      id: OPPORTUNITY_ID,
      data: {
        lastContactAt: OCCURRED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    });
  });

  it('clears the opportunity last contact when there is no point of contact', async () => {
    client.query.mockResolvedValueOnce({
      opportunity: { id: OPPORTUNITY_ID, pointOfContactId: null },
    });

    await recomputeOpportunityLastContact(client as never, OPPORTUNITY_ID);

    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.mutation.mock.calls[0][0].updateOpportunity.__args.data).toEqual(
      {
        lastContactAt: null,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: null,
      },
    );
  });
});
