import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import healthCheck from '../health-check';

const buildConnection = (ids: string[]) => ({
  edges: ids.map((id) => ({ node: { id } })),
});

const mockParticipants = ({
  messageParticipantIds,
  calendarEventParticipantIds,
}: {
  messageParticipantIds: string[];
  calendarEventParticipantIds: string[];
}) =>
  queryMock.mockResolvedValue({
    messageParticipants: buildConnection(messageParticipantIds),
    calendarEventParticipants: buildConnection(calendarEventParticipantIds),
  });

beforeEach(() => {
  queryMock.mockReset();
});

describe('health-check', () => {
  it('should be a valid health check', () => {
    expect(healthCheck.success).toBe(true);
  });

  it('should report nothing once emails are synced', async () => {
    mockParticipants({
      messageParticipantIds: ['message-participant-1'],
      calendarEventParticipantIds: [],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should report nothing once meetings are synced', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: ['calendar-event-participant-1'],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'OK',
    });
  });

  it('should ask to connect an account when nothing is synced', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: [],
    });

    await expect(healthCheck.config.handler()).resolves.toEqual({
      status: 'WARNING',
      title: 'No synced emails or meetings yet',
      description: expect.stringContaining('Connect a mailbox or calendar'),
      action: { label: 'Connect an account', location: '/settings/accounts' },
    });
  });

  it('should read a single participant of each kind', async () => {
    mockParticipants({
      messageParticipantIds: [],
      calendarEventParticipantIds: [],
    });

    await healthCheck.config.handler();

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock.mock.calls[0][0]).toMatchObject({
      messageParticipants: { __args: { first: 1 } },
      calendarEventParticipants: { __args: { first: 1 } },
    });
  });
});
