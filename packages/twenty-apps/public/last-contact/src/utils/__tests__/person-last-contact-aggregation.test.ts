import { describe, expect, it, vi } from 'vitest';

import { pickSelectedFields } from 'src/__tests__/pick-selected-fields';
import { buildPersonAggregates } from 'src/utils/person-last-contact-aggregation';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const SENT_MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const DRAFT_MESSAGE_ID = '33333333-3333-3333-3333-333333333333';
const SENT_AT = '2026-06-01T09:00:00.000Z';
const DRAFTED_AT = '2026-06-10T09:00:00.000Z';

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

describe('buildPersonAggregates', () => {
  it('ignores draft emails', async () => {
    const client = {
      query: vi.fn((query) => {
        if (query.messageParticipants?.edges.node.personId) {
          return Promise.resolve({
            messageParticipants: buildPage(
              [
                {
                  personId: PERSON_ID,
                  message: {
                    id: SENT_MESSAGE_ID,
                    receivedAt: SENT_AT,
                    isDraft: false,
                  },
                },
                {
                  personId: PERSON_ID,
                  message: {
                    id: DRAFT_MESSAGE_ID,
                    receivedAt: DRAFTED_AT,
                    isDraft: true,
                  },
                },
              ].map((node) =>
                pickSelectedFields({
                  record: node,
                  selection: query.messageParticipants.edges.node,
                }),
              ),
            ),
          });
        }

        if (query.messageParticipants) {
          return Promise.resolve({ messageParticipants: buildPage([]) });
        }

        return Promise.resolve({
          calendarEventParticipants: buildPage([]),
          calendarEvents: buildPage([]),
        });
      }),
    };

    const aggregates = await buildPersonAggregates(client as never, [
      PERSON_ID,
    ]);

    expect(aggregates.get(PERSON_ID)).toMatchObject({
      lastContactAt: SENT_AT,
      lastEmail: { at: SENT_AT, id: SENT_MESSAGE_ID },
      item: { kind: 'email', id: SENT_MESSAGE_ID },
    });
  });
});
