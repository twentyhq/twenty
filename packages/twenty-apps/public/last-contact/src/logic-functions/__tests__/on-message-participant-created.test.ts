import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onMessageParticipantCreated from '../on-message-participant-created';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';

const handler = onMessageParticipantCreated.config.handler as (
  batch: unknown,
) => Promise<void>;

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const buildBatch = (
  participants: { personId: string | null; messageId: string | null }[],
) => ({
  name: 'messageParticipant.created',
  events: participants.map(({ personId, messageId }, index) => ({
    recordId: `participant-${index}`,
    properties: { after: { id: `participant-${index}`, personId, messageId } },
  })),
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-message-participant-created definition', () => {
  it('should be valid and batch created participants', () => {
    expect(onMessageParticipantCreated.success).toBe(true);
    expect(
      onMessageParticipantCreated.config.databaseEventTriggerSettings,
    ).toEqual({ eventName: 'messageParticipant.created', batchMode: true });
  });
});

describe('on-message-participant-created handler', () => {
  it('skips participants created without a person, as email sync does', async () => {
    await handler(buildBatch([{ personId: null, messageId: MESSAGE_ID }]));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('updates the person of a participant an app channel created already linked', async () => {
    queryMock.mockImplementation((query) => {
      if (query.messageParticipants) {
        return Promise.resolve({
          messageParticipants: buildPage([
            {
              messageId: MESSAGE_ID,
              role: 'FROM',
              workspaceMemberId: null,
              message: {
                receivedAt: RECEIVED_AT,
                headerMessageId: 'app:linkedin:channel:external-1',
                messageChannelMessageAssociations: {
                  edges: [
                    {
                      node: {
                        direction: 'INCOMING',
                        accountOwnerId: MEMBER_ID,
                      },
                    },
                  ],
                },
              },
            },
          ]),
        });
      }

      if (query.people) {
        return Promise.resolve({
          people: buildPage(
            query.people.__args.filter.id.in.map((id: string) => ({ id })),
          ),
        });
      }

      return Promise.resolve({
        companies: buildPage([]),
        opportunities: buildPage([]),
      });
    });

    await handler(buildBatch([{ personId: PERSON_ID, messageId: MESSAGE_ID }]));

    expect(mutationMock.mock.calls[0][0].createPeople.__args.data).toEqual([
      {
        id: PERSON_ID,
        lastContactAt: RECEIVED_AT,
        lastContactById: MEMBER_ID,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
        lastInboundAt: RECEIVED_AT,
      },
    ]);
  });
});
