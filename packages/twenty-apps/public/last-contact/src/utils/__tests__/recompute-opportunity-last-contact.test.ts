import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recomputeOpportunitiesLastContact } from 'src/utils/recompute-opportunity-last-contact';

const OPPORTUNITY_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_OPPORTUNITY_ID = '44444444-4444-4444-4444-444444444444';
const MESSAGE_ID = '33333333-3333-3333-3333-333333333333';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const POINT_OF_CONTACT = {
  lastContactAt: OCCURRED_AT,
  lastContactItemMessageId: MESSAGE_ID,
  lastContactItemCalendarEventId: null,
};

const buildClient = (opportunities: Record<string, unknown>[]): Client => ({
  query: vi.fn().mockResolvedValue({
    opportunities: {
      edges: opportunities.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  }),
  mutation: vi.fn().mockResolvedValue({}),
});

let client: Client;

beforeEach(() => {
  client = buildClient([]);
});

describe('recomputeOpportunitiesLastContact', () => {
  it('mirrors the point of contact last contact onto the opportunity', async () => {
    client = buildClient([
      { id: OPPORTUNITY_ID, pointOfContact: POINT_OF_CONTACT },
    ]);

    await recomputeOpportunitiesLastContact(client as never, [OPPORTUNITY_ID]);

    expect(
      client.mutation.mock.calls[0][0].createOpportunities.__args,
    ).toEqual({
      upsert: true,
      data: [
        {
          id: OPPORTUNITY_ID,
          lastContactAt: OCCURRED_AT,
          lastContactItemMessageId: MESSAGE_ID,
          lastContactItemCalendarEventId: null,
        },
      ],
    });
  });

  it('clears the opportunity last contact when there is no point of contact', async () => {
    client = buildClient([{ id: OPPORTUNITY_ID, pointOfContact: null }]);

    await recomputeOpportunitiesLastContact(client as never, [OPPORTUNITY_ID]);

    expect(
      client.mutation.mock.calls[0][0].createOpportunities.__args.data,
    ).toEqual([
      {
        id: OPPORTUNITY_ID,
        lastContactAt: null,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: null,
      },
    ]);
  });

  it('resolves a whole batch with one read and one write', async () => {
    client = buildClient([
      { id: OPPORTUNITY_ID, pointOfContact: POINT_OF_CONTACT },
      { id: OTHER_OPPORTUNITY_ID, pointOfContact: POINT_OF_CONTACT },
    ]);

    await recomputeOpportunitiesLastContact(client as never, [
      OPPORTUNITY_ID,
      OTHER_OPPORTUNITY_ID,
    ]);

    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.mutation).toHaveBeenCalledTimes(1);
    expect(
      client.mutation.mock.calls[0][0].createOpportunities.__args.data.map(
        (record: { id: string }) => record.id,
      ),
    ).toEqual([OPPORTUNITY_ID, OTHER_OPPORTUNITY_ID]);
  });

  it('leaves out an opportunity that no longer exists', async () => {
    await recomputeOpportunitiesLastContact(client as never, [OPPORTUNITY_ID]);

    expect(client.mutation).not.toHaveBeenCalled();
  });
});
