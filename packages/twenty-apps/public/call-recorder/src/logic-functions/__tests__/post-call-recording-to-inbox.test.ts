import { isUndefined } from '@sniptt/guards';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { postCallRecordingToInboxHandler } from 'src/logic-functions/post-call-recording-to-inbox';

const queryMock = vi.hoisted(() => vi.fn());
const metadataQueryMock = vi.hoisted(() => vi.fn());
const sendInboxMessageMock = vi.hoisted(() => vi.fn());
const inboxReferenceRecordMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
  },
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  sendInboxMessage: sendInboxMessageMock,
  inboxReferenceRecord: inboxReferenceRecordMock,
}));

const SUMMARY = '## Gist\nGood call.';
const UNAVAILABLE_SUMMARY = '## Summary unavailable\n\nOnly greetings.';
const MEMBER_CANNOT_RECEIVE_ERROR = {
  errors: [{ extensions: { code: 'NOT_FOUND' } }],
};

const CALL_RECORDING = {
  id: 'call-recording-1',
  calendarEventId: 'calendar-event-1',
  summary: { markdown: SUMMARY },
  createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
};

type HandlerEvent = Parameters<typeof postCallRecordingToInboxHandler>[0];

const buildSummaryUpdateEvent = ({
  before = null,
  after = SUMMARY,
}: {
  before?: string | null;
  after?: string | null;
} = {}): HandlerEvent => ({
  name: 'callRecording.updated',
  recordId: 'call-recording-1',
  properties: {
    updatedFields: ['summary'],
    diff: {
      summary: { before: { markdown: before }, after: { markdown: after } },
    },
  },
});

const buildCalendarChannelId = (workspaceMemberId: string): string =>
  `calendar-channel-of-${workspaceMemberId}`;

const buildUserWorkspaceId = (workspaceMemberId: string): string =>
  `user-workspace-of-${workspaceMemberId}`;

const seed = ({
  isInboxEnabled = true,
  callRecording = CALL_RECORDING,
  calendarOwnerWorkspaceMemberIds = ['member-1', 'member-2'],
  attendeeWorkspaceMemberIds = [],
  recapsValueByWorkspaceMemberId = {},
  calendarEventTitle = 'Weekly sync',
}: {
  isInboxEnabled?: boolean;
  callRecording?: object;
  calendarOwnerWorkspaceMemberIds?: string[];
  attendeeWorkspaceMemberIds?: string[];
  recapsValueByWorkspaceMemberId?: Record<string, string>;
  calendarEventTitle?: string;
} = {}) => {
  const workspaceMemberIds = [
    ...new Set([
      ...calendarOwnerWorkspaceMemberIds,
      ...attendeeWorkspaceMemberIds,
    ]),
  ];
  const calendarEvent = {
    id: 'calendar-event-1',
    title: calendarEventTitle,
    calendarChannelEventAssociations: {
      edges: calendarOwnerWorkspaceMemberIds.map((workspaceMemberId) => ({
        node: { calendarChannelId: buildCalendarChannelId(workspaceMemberId) },
      })),
    },
    calendarEventParticipants: {
      totalCount: attendeeWorkspaceMemberIds.length,
      edges: attendeeWorkspaceMemberIds.map((workspaceMemberId) => ({
        node: { handle: `${workspaceMemberId}@acme.com`, workspaceMemberId },
      })),
    },
  };

  queryMock.mockImplementation(async (query: object) => {
    if ('callRecordings' in query) {
      return { callRecordings: { edges: [{ node: callRecording }] } };
    }

    return {
      calendarEvents: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [{ node: calendarEvent }],
      },
    };
  });
  metadataQueryMock.mockImplementation(async (query: object) => {
    if ('currentWorkspace' in query) {
      return {
        currentWorkspace: {
          featureFlags: [
            { key: 'IS_AI_CHAT_INBOX_ENABLED', value: isInboxEnabled },
            { key: 'IS_MCP_SERVERS_ENABLED', value: true },
          ],
        },
      };
    }

    if ('calendarChannels' in query) {
      return {
        calendarChannels: calendarOwnerWorkspaceMemberIds.map(
          (workspaceMemberId) => ({
            id: buildCalendarChannelId(workspaceMemberId),
            handle: `${workspaceMemberId}@gmail.com`,
            connectedAccount: {
              userWorkspaceId: buildUserWorkspaceId(workspaceMemberId),
            },
          }),
        ),
      };
    }

    return {
      myUserApplicationVariables: workspaceMemberIds.map(
        (workspaceMemberId) => ({
          userWorkspaceId: buildUserWorkspaceId(workspaceMemberId),
          workspaceMemberId,
          variables: isUndefined(
            recapsValueByWorkspaceMemberId[workspaceMemberId],
          )
            ? []
            : [
                {
                  key: 'CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED',
                  value: recapsValueByWorkspaceMemberId[workspaceMemberId],
                },
              ],
        }),
      ),
    };
  });
};

describe('post-call-recording-to-inbox logic function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seed();
    inboxReferenceRecordMock.mockResolvedValue('[[record:call-recording-1]]');
    sendInboxMessageMock.mockResolvedValue({ threadId: 'thread-1' });
  });

  it('sends each member who has the meeting on their calendar their own conversation', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-2', 'member-1', 'member-2'],
    });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'sent',
      workspaceMemberCount: 2,
      recapWorkspaceMemberCount: 0,
      skippedWorkspaceMemberCount: 0,
    });
    expect(sendInboxMessageMock.mock.calls).toEqual([
      [
        expect.objectContaining({
          workspaceMemberIds: ['member-1'],
          threadKey: 'call-recording-ready-member-1',
          idempotencyKey: 'call-recording-ready-member-1',
          text: expect.stringContaining('[[record:call-recording-1]]'),
        }),
      ],
      [
        expect.objectContaining({
          workspaceMemberIds: ['member-2'],
          threadKey: 'call-recording-ready-member-2',
          idempotencyKey: 'call-recording-ready-member-2',
        }),
      ],
    ]);
  });

  it('sends nothing to a member who attends without the meeting on a calendar of theirs', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      attendeeWorkspaceMemberIds: ['member-1', 'member-2'],
    });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({ outcome: 'sent', workspaceMemberCount: 1 });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(1);
    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceMemberIds: ['member-1'] }),
    );
  });

  it('sends to the owner of the calendar even when they are not an attendee by email', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      attendeeWorkspaceMemberIds: ['member-2'],
    });

    await postCallRecordingToInboxHandler(buildSummaryUpdateEvent());

    expect(sendInboxMessageMock.mock.calls).toEqual([
      [expect.objectContaining({ workspaceMemberIds: ['member-1'] })],
    ]);
  });

  it('sends the members who asked for recaps their own conversation per call', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-1', 'member-2', 'member-3'],
      recapsValueByWorkspaceMemberId: {
        'member-1': 'true',
        'member-3': 'true',
      },
    });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({ workspaceMemberCount: 3, recapWorkspaceMemberCount: 2 });

    const recap = {
      title: 'Weekly sync',
      text: 'Good call.\n\n[[record:call-recording-1]]',
    };

    expect(sendInboxMessageMock.mock.calls).toEqual([
      [
        {
          ...recap,
          workspaceMemberIds: ['member-1'],
          threadKey: 'call-recording-recap-call-recording-1-member-1',
          idempotencyKey: 'call-recording-recap-call-recording-1-member-1',
        },
      ],
      [
        {
          ...recap,
          workspaceMemberIds: ['member-3'],
          threadKey: 'call-recording-recap-call-recording-1-member-3',
          idempotencyKey: 'call-recording-recap-call-recording-1-member-3',
        },
      ],
      [
        expect.objectContaining({
          workspaceMemberIds: ['member-2'],
          threadKey: 'call-recording-ready-member-2',
        }),
      ],
    ]);
  });

  it('sends no recap to a member who asked for recaps but does not have the meeting on a calendar of theirs', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      attendeeWorkspaceMemberIds: ['member-2'],
      recapsValueByWorkspaceMemberId: { 'member-2': 'true' },
    });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({ workspaceMemberCount: 1, recapWorkspaceMemberCount: 0 });
    expect(sendInboxMessageMock.mock.calls).toEqual([
      [expect.objectContaining({ workspaceMemberIds: ['member-1'] })],
    ]);
  });

  it('treats recaps switched off or never set as off', async () => {
    seed({ recapsValueByWorkspaceMemberId: { 'member-1': 'false' } });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({ workspaceMemberCount: 2, recapWorkspaceMemberCount: 0 });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Your call recording is ready' }),
    );
  });

  it('lists the action items in the recap and offers to create the tasks', async () => {
    seed({
      callRecording: {
        ...CALL_RECORDING,
        summary: {
          markdown:
            '## Gist\nGood call.\n\n## Action Items\n**Alex**\n- Send the pricing deck\n\n## Notes\n**Intro** — 0:00',
        },
      },
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      recapsValueByWorkspaceMemberId: { 'member-1': 'true' },
    });

    await postCallRecordingToInboxHandler(buildSummaryUpdateEvent());

    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Good call.\n\n**Action items**\n\n**Alex**\n- Send the pricing deck\n\n[[record:call-recording-1]]',
        toolCall: expect.objectContaining({
          input: expect.objectContaining({
            options: [
              { label: 'Create the follow-up tasks' },
              { label: 'Draft a follow-up email' },
            ],
          }),
        }),
      }),
    );
  });

  it('sends the action items alone when the summary has no gist', async () => {
    seed({
      callRecording: {
        ...CALL_RECORDING,
        summary: {
          markdown: '## Action Items\n**Alex**\n- Send the pricing deck',
        },
      },
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      recapsValueByWorkspaceMemberId: { 'member-1': 'true' },
    });

    await postCallRecordingToInboxHandler(buildSummaryUpdateEvent());

    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: '**Action items**\n\n**Alex**\n- Send the pricing deck\n\n[[record:call-recording-1]]',
      }),
    );
  });

  it('does not show a meeting title that is not shared', async () => {
    seed({
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      recapsValueByWorkspaceMemberId: { 'member-1': 'true' },
      calendarEventTitle: 'FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED',
    });

    await postCallRecordingToInboxHandler(buildSummaryUpdateEvent());

    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Call recap' }),
    );
  });

  it('sends a recap without a gist when the summary has none', async () => {
    seed({
      callRecording: {
        ...CALL_RECORDING,
        summary: { markdown: '## Overview\nA short sync.' },
      },
      calendarOwnerWorkspaceMemberIds: ['member-1'],
      recapsValueByWorkspaceMemberId: { 'member-1': 'true' },
    });

    await postCallRecordingToInboxHandler(buildSummaryUpdateEvent());

    expect(sendInboxMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Your call was recorded: [[record:call-recording-1]].',
      }),
    );
  });

  it('sends when a summary replaces an unavailable one', async () => {
    await postCallRecordingToInboxHandler(
      buildSummaryUpdateEvent({ before: UNAVAILABLE_SUMMARY }),
    );

    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
  });

  it('reads the stored summary when the event carries no diff', async () => {
    await postCallRecordingToInboxHandler({
      name: 'callRecording.updated',
      recordId: 'call-recording-1',
      properties: { updatedFields: ['summary'] },
    });

    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    {
      case: 'another field changed',
      event: {
        ...buildSummaryUpdateEvent(),
        properties: { updatedFields: ['transcript'] },
      },
    },
    {
      case: 'the summary was edited',
      event: buildSummaryUpdateEvent({
        before: SUMMARY,
        after: '## Gist\nOk.',
      }),
    },
    {
      case: 'the new summary is unavailable',
      event: buildSummaryUpdateEvent({ after: UNAVAILABLE_SUMMARY }),
    },
    {
      case: 'the summary was cleared',
      event: buildSummaryUpdateEvent({ before: SUMMARY, after: null }),
    },
  ])('makes no request when $case', async ({ event }) => {
    expect(await postCallRecordingToInboxHandler(event)).toMatchObject({
      skipped: true,
    });
    expect(metadataQueryMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
    expect(sendInboxMessageMock).not.toHaveBeenCalled();
  });

  it('sends nothing while Inbox is off', async () => {
    seed({ isInboxEnabled: false });

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({ outcome: 'inbox-disabled' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(sendInboxMessageMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      outcome: 'not-app-recording',
      meeting: {
        callRecording: {
          ...CALL_RECORDING,
          createdBy: { source: 'MANUAL', name: 'Ada' },
        },
      },
    },
    {
      outcome: 'no-summary',
      meeting: {
        callRecording: { ...CALL_RECORDING, summary: { markdown: null } },
      },
    },
    {
      outcome: 'no-workspace-members',
      meeting: { calendarOwnerWorkspaceMemberIds: [] },
    },
  ])(
    'sends nothing when the outcome is $outcome',
    async ({ outcome, meeting }) => {
      seed(meeting);

      expect(
        await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
      ).toMatchObject({ outcome });
      expect(sendInboxMessageMock).not.toHaveBeenCalled();
    },
  );

  it('skips a member who cannot receive it and sends to the others', async () => {
    sendInboxMessageMock.mockRejectedValueOnce(MEMBER_CANNOT_RECEIVE_ERROR);

    expect(
      await postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).toMatchObject({
      outcome: 'sent',
      workspaceMemberCount: 2,
      skippedWorkspaceMemberCount: 1,
    });
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
  });

  it('asks for a retry when a send fails, after trying every member', async () => {
    sendInboxMessageMock.mockRejectedValueOnce(new Error('503'));

    await expect(
      postCallRecordingToInboxHandler(buildSummaryUpdateEvent()),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
    expect(sendInboxMessageMock).toHaveBeenCalledTimes(2);
  });
});
