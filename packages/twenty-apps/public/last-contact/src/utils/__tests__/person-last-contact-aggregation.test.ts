import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { buildPersonAggregates } from 'src/utils/person-last-contact-aggregation';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MEMBER_ID = '22222222-2222-2222-2222-222222222222';
const OTHER_MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const MESSAGE_ID = '44444444-4444-4444-4444-444444444444';
const CALENDAR_EVENT_ID = '55555555-5555-5555-5555-555555555555';
const NOW = '2026-06-12T12:00:00.000Z';
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';
const STARTS_AT = '2026-06-01T09:00:00.000Z';

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const nested = (nodes: Record<string, unknown>[], totalCount = nodes.length) => ({
  totalCount,
  edges: nodes.map((node) => ({ node })),
});

const buildClient = ({
  messageParticipantsTotalCount,
  fallbackMessageParticipants = [],
}: {
  messageParticipantsTotalCount?: number;
  fallbackMessageParticipants?: Record<string, unknown>[];
} = {}) => {
  const queryMock = vi.fn().mockImplementation((query) => {
    if (query.messageParticipants?.__args.filter.personId) {
      return Promise.resolve({
        messageParticipants: buildPage([
          {
            id: 'participant-1',
            personId: PERSON_ID,
            message: {
              id: MESSAGE_ID,
              receivedAt: RECEIVED_AT,
              messageParticipants: nested(
                [
                  { role: 'TO', workspaceMemberId: null },
                  { role: 'FROM', workspaceMemberId: MEMBER_ID },
                ],
                messageParticipantsTotalCount,
              ),
            },
          },
        ]),
      });
    }

    if (query.messageParticipants) {
      return Promise.resolve({
        messageParticipants: buildPage(fallbackMessageParticipants),
      });
    }

    if (query.calendarEventParticipants?.__args.filter.personId) {
      return Promise.resolve({
        calendarEventParticipants: buildPage([
          {
            id: 'participant-2',
            personId: PERSON_ID,
            calendarEvent: {
              id: CALENDAR_EVENT_ID,
              startsAt: STARTS_AT,
              isCanceled: false,
              calendarEventParticipants: nested([
                { isOrganizer: false, workspaceMemberId: OTHER_MEMBER_ID },
                { isOrganizer: true, workspaceMemberId: MEMBER_ID },
              ]),
            },
          },
        ]),
      });
    }

    return Promise.resolve({ calendarEventParticipants: buildPage([]) });
  });

  return { client: { query: queryMock } as unknown as CoreApiClient, queryMock };
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildPersonAggregates', () => {
  it('resolves owners and direction from nested participants in two queries', async () => {
    const { client, queryMock } = buildClient();

    const aggByPersonId = await buildPersonAggregates(client, [PERSON_ID]);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(aggByPersonId.get(PERSON_ID)).toEqual({
      lastEmail: { at: RECEIVED_AT, id: MESSAGE_ID },
      lastMeeting: { at: STARTS_AT, id: CALENDAR_EVENT_ID },
      lastOutboundAt: RECEIVED_AT,
      lastInboundAt: STARTS_AT,
      lastContactAt: RECEIVED_AT,
      lastContactById: MEMBER_ID,
      item: { kind: 'email', id: MESSAGE_ID },
    });
  });

  it('reads the participants of a message past the nested relation cap', async () => {
    const { client, queryMock } = buildClient({
      messageParticipantsTotalCount: 61,
      fallbackMessageParticipants: [
        { messageId: MESSAGE_ID, role: 'TO', workspaceMemberId: OTHER_MEMBER_ID },
      ],
    });

    const aggByPersonId = await buildPersonAggregates(client, [PERSON_ID]);

    const fallbackCall = queryMock.mock.calls.find(
      ([query]) => query.messageParticipants?.__args.filter.messageId,
    );
    expect(
      fallbackCall?.[0].messageParticipants.__args.filter.messageId,
    ).toEqual({ in: [MESSAGE_ID] });
    expect(aggByPersonId.get(PERSON_ID)).toMatchObject({
      lastContactById: OTHER_MEMBER_ID,
      lastInboundAt: RECEIVED_AT,
    });
  });
});
