import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notifyFirstCallRecordingHandler } from 'src/logic-functions/notify-first-call-recording';

const queryMock = vi.hoisted(() => vi.fn());
const sendInboxMessageMock = vi.hoisted(() => vi.fn());
const kvGetMock = vi.hoisted(() => vi.fn());
const kvSetMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sendInboxMessage: sendInboxMessageMock,
  kv: { get: kvGetMock, set: kvSetMock },
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
    { workspaceMemberId: null, isOrganizer: false },
  ],
}: {
  status?: string;
  participants?: { workspaceMemberId: string | null; isOrganizer: boolean }[];
} = {}) =>
  queryMock.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            id: 'call-recording-1',
            title: 'Weekly sync',
            status,
            calendarEvent: {
              id: 'calendar-event-1',
              calendarEventParticipants: {
                edges: participants.map((participant) => ({
                  node: participant,
                })),
              },
            },
          },
        },
      ],
    },
  });

describe('notify-first-call-recording logic function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kvGetMock.mockResolvedValue(null);
    kvSetMock.mockResolvedValue(undefined);
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
      failedWorkspaceMemberIds: [],
    });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
    expect(sendInboxMessageMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        workspaceMemberId: 'member-organizer',
        title: 'Your first call recording is ready',
        text: expect.stringContaining('Weekly sync'),
        context: expect.stringContaining('call-recording-1'),
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
    expect(kvSetMock).toHaveBeenCalledWith(
      'first-call-recording-notified:member-organizer',
      'thread-for-member-organizer',
    );
  });

  it('does not message a member twice', async () => {
    mockCallRecording();
    kvGetMock.mockImplementation(async (key: string) =>
      key.endsWith('member-organizer') ? 'earlier-thread' : null,
    );

    const result = await notifyFirstCallRecordingHandler(buildEvent());

    expect(sendInboxMessageMock).toHaveBeenCalledTimes(1);
    expect(sendInboxMessageMock.mock.calls[0][0].workspaceMemberId).toBe(
      'member-attendee',
    );
    expect(result).toMatchObject({
      notifiedWorkspaceMemberIds: ['member-attendee'],
    });
  });

  it('keeps notifying the other attendees when one cannot be messaged', async () => {
    mockCallRecording();
    sendInboxMessageMock.mockImplementation(async ({ workspaceMemberId }) => {
      if (workspaceMemberId === 'member-organizer') {
        throw new Error('Chat thread not found.');
      }

      return { threadId: 'thread-for-attendee' };
    });

    const result = await notifyFirstCallRecordingHandler(buildEvent());

    expect(result).toMatchObject({
      notifiedWorkspaceMemberIds: ['member-attendee'],
      failedWorkspaceMemberIds: ['member-organizer'],
    });
    expect(kvSetMock).toHaveBeenCalledTimes(1);
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
