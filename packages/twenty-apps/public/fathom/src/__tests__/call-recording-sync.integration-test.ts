import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCallRecordingSyncTestContext } from 'src/__tests__/utils/create-call-recording-sync-test-context.util';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { filterImportableFathomMeetings } from 'src/logic-functions/utils/filter-importable-fathom-meetings.util';
import { findCallRecordingSyncStates } from 'src/logic-functions/utils/find-call-recording-sync-states.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';

const mocks = vi.hoisted(() => ({
  enqueueJobs: vi.fn(),
  kvGet: vi.fn(),
  kvSet: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: mocks.enqueueJobs,
  kv: { get: mocks.kvGet, set: mocks.kvSet },
}));

const context = createCallRecordingSyncTestContext();

describe('Fathom call recording sync', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.kvGet.mockResolvedValue(null);
    await context.setUp();
  });

  afterEach(() => context.cleanUp());

  it('skips a completed recording only while its transcript has entries', async () => {
    const meetings = context.buildMeetings(2);
    const callRecordingIds = context.getCallRecordingIds(meetings);

    await context.syncPage(meetings);
    await context.settleMedia(callRecordingIds);
    await context.coreApiClient.mutation({
      updateCallRecording: {
        __args: { id: callRecordingIds[1], data: { transcript: [] } },
        id: true,
      },
    });

    expect(
      await filterImportableFathomMeetings({
        coreApiClient: context.syncClient,
        meetings: meetings.map(serializeFathomMeeting),
      }),
    ).toEqual({
      importableMeetings: [serializeFathomMeeting(meetings[1])],
      deletedMeetingCount: 0,
      upToDateMeetingCount: 1,
    });
  });

  it('neither resurrects nor updates a recording the user deleted', async () => {
    const [meeting] = context.buildMeetings(1);
    const [callRecordingId] = context.getCallRecordingIds([meeting]);

    await context.syncPage([meeting]);
    await context.coreApiClient.mutation({
      deleteCallRecording: { __args: { id: callRecordingId }, id: true },
    });

    const deletedCallRecording =
      await context.readCallRecording(callRecordingId);

    context.clearMutations();

    expect(await context.syncPage([meeting])).toMatchObject({
      importableMeetings: [],
      deletedMeetingCount: 1,
    });
    expect(await context.syncMeeting({ meeting })).toEqual({
      callRecordingId,
      skipped: true,
      reason: 'The call recording has been deleted',
    });
    expect(context.getMutationNames()).toEqual([]);

    await expect(
      context.syncMeeting({ meeting, callRecordingSyncStates: new Map() }),
    ).rejects.toThrow();
    expect(context.getMutationNames()).toEqual([['createCallRecording']]);
    expect(await context.readCallRecording(callRecordingId)).toEqual(
      deletedCallRecording,
    );
  });

  it('never completes a recording without transcript entries or with media still pending', async () => {
    const meetings = context.buildMeetings(2);
    const [untranscribedCallRecordingId, pendingMediaCallRecordingId] =
      context.getCallRecordingIds(meetings);

    await context.syncPage(meetings);
    await context.coreApiClient.mutation({
      updateCallRecording: {
        __args: { id: untranscribedCallRecordingId, data: { transcript: [] } },
        id: true,
      },
    });
    await context.markMediaUnavailable([untranscribedCallRecordingId]);

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient: context.syncClient,
        callRecordingId: untranscribedCallRecordingId,
      }),
    ).toBe(false);

    await context.syncMeeting({ meeting: { ...meetings[0], transcript: [] } });

    expect(
      await context.readCallRecording(untranscribedCallRecordingId),
    ).toMatchObject({ status: 'PROCESSING' });

    context.clearMutations();

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient: context.syncClient,
        callRecordingId: pendingMediaCallRecordingId,
      }),
    ).toBe(false);
    expect(context.getMutationNames()).toEqual([]);
    expect(
      await context.readCallRecording(pendingMediaCallRecordingId),
    ).toMatchObject({ status: 'PROCESSING' });
  });

  it('updates and completes an existing recording from the state it read, unless it changed since', async () => {
    const meetings = context.buildMeetings(2);
    const [updatedCallRecordingId, renamedCallRecordingId] =
      context.getCallRecordingIds(meetings);
    const [updatedMeeting, renamedMeeting] = meetings.map((meeting) => ({
      ...meeting,
      recordingEndTime: new Date(
        meeting.recordingEndTime.getTime() + 5 * 60_000,
      ),
    }));

    await context.syncPage(meetings);
    await context.markMediaUnavailable([updatedCallRecordingId]);

    const callRecordingSyncStates = await findCallRecordingSyncStates({
      coreApiClient: context.syncClient,
      callRecordingIds: [updatedCallRecordingId, renamedCallRecordingId],
    });

    expect(
      await context.syncMeeting({
        meeting: updatedMeeting,
        callRecordingSyncStates,
      }),
    ).toEqual(
      expect.objectContaining({
        callRecordingId: updatedCallRecordingId,
        created: false,
      }),
    );

    const updatedCallRecording = await context.readCallRecording(
      updatedCallRecordingId,
    );

    expect(updatedCallRecording?.status).toBe('COMPLETED');
    expect(Date.parse(updatedCallRecording?.endedAt ?? '')).toBe(
      updatedMeeting.recordingEndTime.getTime(),
    );

    await context.coreApiClient.mutation({
      updateCallRecording: {
        __args: {
          id: renamedCallRecordingId,
          data: { title: 'Renewal follow-up' },
        },
        id: true,
      },
    });

    const renamedCallRecording = await context.readCallRecording(
      renamedCallRecordingId,
    );

    await expect(
      context.syncMeeting({
        meeting: renamedMeeting,
        callRecordingSyncStates,
      }),
    ).rejects.toThrow(
      'Fathom recording changed during import; retry the import',
    );
    expect(await context.readCallRecording(renamedCallRecordingId)).toEqual(
      renamedCallRecording,
    );
  });
});
