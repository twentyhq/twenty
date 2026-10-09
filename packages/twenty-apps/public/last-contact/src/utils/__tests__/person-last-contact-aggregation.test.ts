import { describe, expect, it, vi } from 'vitest';

import { buildPersonAggregates } from 'src/utils/person-last-contact-aggregation';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';

const emptyPage = {
  edges: [],
  pageInfo: { hasNextPage: false, endCursor: null },
};

describe('buildPersonAggregates', () => {
  it('reads only the emails that were sent, leaving drafts out', async () => {
    const client = {
      query: vi
        .fn()
        .mockImplementation((query) =>
          Promise.resolve(
            query.messageParticipants
              ? { messageParticipants: emptyPage }
              : { calendarEventParticipants: emptyPage },
          ),
        ),
    };

    await buildPersonAggregates(client as never, [PERSON_ID]);

    const emailQuery = client.query.mock.calls.find(
      ([query]) => query.messageParticipants,
    )?.[0];

    expect(emailQuery.messageParticipants.__args.filter).toEqual({
      personId: { in: [PERSON_ID] },
      message: { isDraft: { eq: false } },
    });
  });
});
