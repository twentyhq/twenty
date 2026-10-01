import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notifyFirstCallRecordingHandler } from 'src/logic-functions/notify-first-call-recording';

const queryMock = vi.hoisted(() => vi.fn());
const sendInboxMessageMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sendInboxMessage: sendInboxMessageMock,
}));

type HandlerEvent = Parameters<typeof notifyFirstCallRecordingHandler>[0];

const buildEvent = ({
  name = 'callRecording.updated',
  updatedFields = ['status'],
  after,
}: {
  name?: string;
  updatedFields?: string[];
  after?: { id: string; status: string };
} = {}): HandlerEvent =>
  ({
    name,
    workspaceId: 'workspace-id',
    recordId: 'call-recording-1',
    objectMetadata: {},
    properties: { updatedFields, ...(after ? { after } : {}) },
  }) as unknown as HandlerEvent;

const mockCallRecording = ({
  status = 'COMPLETED',
  participants = [
    { workspaceMemberId: 'member-attendee', isOrganizer: false },
    { workspaceMemberId: 'member-organizer', isOrganizer: true },
  ],
}: {
  status?: string;
  participants?: { workspaceMemberId: string; isOrganizer: boolean }[];
} = {}) =>
  queryMock
    .mockResolvedValueOnce({
      callRecordings: {
        edges: [
          {
            node: {
              id: 'call-recording-1',
              title: 'Weekly sync',
              status,
              calendarEventId: 'calendar-event-1',
            },
          },
        ],
      },
    })
    .mockResolvedValueOnce({
      calendarEventParticipants: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: participants.map((participant) => ({ node: participant })),
      },
    });

describe('notify-first-call-recording logic function', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sendInboxMessageMock.mockImplementation(async ({ workspaceMemberId }) => ({
      threadId: `thread-for-${workspaceMemberId}`,
    }));
  });

  it('asks each attendee in Twenty, organizer first, whether to share their first recording', async () => {
    mockCallRecording();

    const result = await notifyFirstCallRecordingHandler(buildEvent());

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'notified',
      notifiedWorkspaceMemberIds: ['member-organizer', 'member-attendee'],
    });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
    expect(sendInboxMessageMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        workspaceMemberId: 'member-organizer',
        idempotencyKey: 'first-call-recording',
        title: 'Your first call recording is ready',
        text: expect.stringContaining(
          '[[record:calendarEvent:calendar-event-1:Weekly sync]]',
        ),
        questions: [
          expect.objectContaining({
            options: [
              expect.objectContaining({ label: 'Draft a recap email' }),
              { label: 'Not now' },
            ],
          }),
        ],
      }),
    );
    expect(queryMock.mock.calls[1][0]).toMatchObject({
      calendarEventParticipants: {
        __args: {
          filter: {
            calendarEventId: { eq: 'calendar-event-1' },
            workspaceMemberId: { is: 'NOT_NULL' },
          },
        },
      },
    });
  });

  it('notifies the other attendees, then fails retryably when one could not be messaged', async () => {
    mockCallRecording();
    sendInboxMessageMock.mockImplementation(async ({ workspaceMemberId }) => {
      if (workspaceMemberId === 'member-organizer') {
        throw new Error('Chat thread not found.');
      }

      return { threadId: 'thread-for-attendee' };
    });

    await expect(
      notifyFirstCallRecordingHandler(buildEvent()),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('member-organizer'),
    });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
  });

  it('skips a status change to anything but completed without fetching', async () => {
    const result = await notifyFirstCallRecordingHandler(
      buildEvent({ after: { id: 'call-recording-1', status: 'PROCESSING' } }),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'call recording is not completed',
    });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('does nothing when the fetched recording is not completed', async () => {
    mockCallRecording({ status: 'FAILED' });

    const result = await notifyFirstCallRecordingHandler(buildEvent());

    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'not-completed',
    });
    expect(sendInboxMessageMock).not.toHaveBeenCalled();
  });

  it('skips updates that do not touch the status', async () => {
    const result = await notifyFirstCallRecordingHandler(
      buildEvent({ updatedFields: ['transcript'] }),
    );

    expect(result).toEqual({ skipped: true, reason: 'status unchanged' });
    expect(queryMock).not.toHaveBeenCalled();
  });
});
