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
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const RECEIVED_AT = '2026-06-10T09:00:00.000Z';

const handler = onEmailInteraction.config.handler as (
  event: unknown,
) => Promise<void>;

const buildEvent = ({
  personId,
  messageId,
}: {
  personId: string | null;
  messageId: string | null;
}) => ({
  recordId: 'participant-1',
  properties: {
    updatedFields: ['personId'],
    after: { id: 'participant-1', personId, messageId },
  },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updatePeople: [{ id: 'updated' }] });
});

describe('on-email-interaction definition', () => {
  it('should be valid and only trigger on personId updates', () => {
    expect(onEmailInteraction.success).toBe(true);
    expect(onEmailInteraction.config.databaseEventTriggerSettings).toEqual({
      eventName: 'messageParticipant.updated',
      updatedFields: ['personId'],
    });
  });
});

describe('on-email-interaction handler', () => {
  it('sets interaction, owner, item, contacted and lastEmail for an outbound email', async () => {
    queryMock
      .mockResolvedValueOnce({
        messageParticipants: {
          edges: [
            {
              node: {
                role: 'TO',
                workspaceMemberId: null,
                message: { receivedAt: RECEIVED_AT },
              },
            },
            {
              node: {
                role: 'FROM',
                workspaceMemberId: MEMBER_ID,
                message: { receivedAt: RECEIVED_AT },
              },
            },
          ],
        },
      })
      .mockResolvedValueOnce({ person: null });

    await handler(buildEvent({ personId: PERSON_ID, messageId: MESSAGE_ID }));

    const data = mutationMock.mock.calls[0][0].updatePeople.__args.data;
    expect(data).toEqual({
      lastContactAt: RECEIVED_AT,
      lastContactById: MEMBER_ID,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
      lastOutboundAt: RECEIVED_AT,
      lastEmailId: MESSAGE_ID,
    });
  });

  it('should do nothing when the participant has no personId', async () => {
    await handler(buildEvent({ personId: null, messageId: MESSAGE_ID }));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the participant has no messageId', async () => {
    await handler(buildEvent({ personId: PERSON_ID, messageId: null }));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('should not update the person when the message has no receivedAt', async () => {
    queryMock.mockResolvedValue({
      messageParticipants: {
        edges: [
          {
            node: {
              role: 'FROM',
              workspaceMemberId: MEMBER_ID,
              message: { receivedAt: null },
            },
          },
        ],
      },
    });

    await handler(buildEvent({ personId: PERSON_ID, messageId: MESSAGE_ID }));

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
