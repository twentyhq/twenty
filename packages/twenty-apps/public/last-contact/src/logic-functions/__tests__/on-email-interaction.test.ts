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

import onEmailInteraction from '../on-email-interaction';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const OLDER_MESSAGE_ID = '44444444-4444-4444-4444-444444444444';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';
const OLDER_RECEIVED_AT = '2026-06-01T09:00:00.000Z';

const handler = onEmailInteraction.config.handler as (
  batch: unknown,
) => Promise<void>;

const buildPage = (nodes: Record<string, unknown>[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const buildBatch = (
  participants: { personId: string | null; messageId: string | null }[],
) => ({
  name: 'messageParticipant.updated',
  events: participants.map(({ personId, messageId }, index) => ({
    recordId: `participant-${index}`,
    properties: {
      updatedFields: ['personId'],
      after: { id: `participant-${index}`, personId, messageId },
    },
  })),
});

const setupQueryMock = (messageParticipants: Record<string, unknown>[]) => {
  queryMock.mockImplementation((query) => {
    if (query.messageParticipants) {
      return Promise.resolve({
        messageParticipants: buildPage(messageParticipants),
      });
    }

    if (query.person) {
      return Promise.resolve({ person: null });
    }

    if (query.people) {
      return Promise.resolve({ people: buildPage([]) });
    }

    return Promise.resolve({ opportunities: buildPage([]) });
  });
};

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
});

describe('on-email-interaction definition', () => {
  it('should be valid and batch personId updates', () => {
    expect(onEmailInteraction.success).toBe(true);
    expect(onEmailInteraction.config.databaseEventTriggerSettings).toEqual({
      eventName: 'messageParticipant.updated',
      updatedFields: ['personId'],
      batchMode: true,
    });
  });
});

describe('on-email-interaction handler', () => {
  it('sets interaction, owner, item, contacted and lastEmail for an outbound email', async () => {
    setupQueryMock([
      {
        messageId: MESSAGE_ID,
        role: 'TO',
        workspaceMemberId: null,
        message: { receivedAt: RECEIVED_AT },
      },
      {
        messageId: MESSAGE_ID,
        role: 'FROM',
        workspaceMemberId: MEMBER_ID,
        message: { receivedAt: RECEIVED_AT },
      },
    ]);

    await handler(
      buildBatch([{ personId: PERSON_ID, messageId: MESSAGE_ID }]),
    );

    expect(mutationMock.mock.calls[0][0].updatePeople.__args.data).toEqual({
      lastContactAt: RECEIVED_AT,
      lastContactById: MEMBER_ID,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
      lastOutboundAt: RECEIVED_AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('resolves every message of the batch in one query and updates each person once', async () => {
    setupQueryMock([
      {
        messageId: OLDER_MESSAGE_ID,
        role: 'FROM',
        workspaceMemberId: null,
        message: { receivedAt: OLDER_RECEIVED_AT },
      },
      {
        messageId: MESSAGE_ID,
        role: 'FROM',
        workspaceMemberId: MEMBER_ID,
        message: { receivedAt: RECEIVED_AT },
      },
    ]);

    await handler(
      buildBatch([
        { personId: PERSON_ID, messageId: OLDER_MESSAGE_ID },
        { personId: PERSON_ID, messageId: MESSAGE_ID },
      ]),
    );

    const participantQueries = queryMock.mock.calls.filter(
      ([query]) => query.messageParticipants,
    );
    expect(participantQueries).toHaveLength(1);
    expect(
      participantQueries[0][0].messageParticipants.__args.filter,
    ).toEqual({ messageId: { in: [OLDER_MESSAGE_ID, MESSAGE_ID] } });

    const personUpdates = mutationMock.mock.calls.filter(
      ([mutation]) => mutation.updatePeople,
    );
    expect(personUpdates).toHaveLength(1);
    expect(personUpdates[0][0].updatePeople.__args.data).toEqual({
      lastContactAt: RECEIVED_AT,
      lastContactById: MEMBER_ID,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
      lastOutboundAt: RECEIVED_AT,
      lastInboundAt: OLDER_RECEIVED_AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('should do nothing when no participant has both a person and a message', async () => {
    await handler(
      buildBatch([
        { personId: null, messageId: MESSAGE_ID },
        { personId: PERSON_ID, messageId: null },
      ]),
    );

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('should not update the person when the message has no receivedAt', async () => {
    setupQueryMock([
      {
        messageId: MESSAGE_ID,
        role: 'FROM',
        workspaceMemberId: MEMBER_ID,
        message: { receivedAt: null },
      },
    ]);

    await handler(
      buildBatch([{ personId: PERSON_ID, messageId: MESSAGE_ID }]),
    );

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
