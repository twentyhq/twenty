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
  mutationMock.mockResolvedValue({ updatePeople: [] });
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
  it('should update the person with the triggering message receivedAt', async () => {
    queryMock.mockResolvedValue({
      message: { id: MESSAGE_ID, receivedAt: RECEIVED_AT },
    });

    await handler(buildEvent({ personId: PERSON_ID, messageId: MESSAGE_ID }));

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith({
      message: {
        __args: { filter: { id: { eq: MESSAGE_ID } } },
        id: true,
        receivedAt: true,
      },
    });
    expect(mutationMock).toHaveBeenCalledTimes(1);
    const mutationArgs = mutationMock.mock.calls[0][0];
    expect(mutationArgs.updatePeople.__args.data).toEqual({
      lastContactAt: RECEIVED_AT,
    });
    expect(mutationArgs.updatePeople.__args.filter.and).toContainEqual({
      id: { eq: PERSON_ID },
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
      message: { id: MESSAGE_ID, receivedAt: null },
    });

    await handler(buildEvent({ personId: PERSON_ID, messageId: MESSAGE_ID }));

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
