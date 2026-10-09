import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { randomInt } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { findCallRecordingSyncStates } from 'src/logic-functions/utils/find-call-recording-sync-states.util';
import { filterImportableFathomMeetings } from 'src/logic-functions/utils/filter-importable-fathom-meetings.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { syncFathomMeetingsToCallRecordings } from 'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util';

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

const CONNECTED_ACCOUNT_ID = '9f7e3c1a-5b2d-4e8f-a6c9-0d1b2e3f4a5b';
const TRANSCRIPT = [
  {
    speaker: { displayName: 'Owner' },
    text: 'Let us review the renewal.',
    timestamp: '00:00:05',
  },
];

const callRecordingSnapshotsSchema = z.object({
  callRecordings: z.object({
    edges: z.array(
      z.object({
        node: z.object({
          id: z.string(),
          updatedAt: z.string(),
          deletedAt: z.string().nullable(),
          status: z.string().nullable(),
          title: z.string().nullable(),
          endedAt: z.string().nullable(),
        }),
      }),
    ),
  }),
});

const coreApiClient = new CoreApiClient();
const createdCallRecordingIds = new Set<string>();

const buildMeetings = (count: number): Meeting[] =>
  Array.from({ length: count }, () => {
    const meeting = buildFathomMeeting({
      recordingId: randomInt(1, 2 ** 47),
    });

    createdCallRecordingIds.add(
      computeCallRecordingIdForFathomMeeting(meeting.recordingId),
    );

    return {
      ...meeting,
      meetingUrl: null,
      transcript: TRANSCRIPT,
      defaultSummary: { templateName: null, markdownFormatted: 'Renewal' },
    };
  });

const getCallRecordingIds = (meetings: Meeting[]) =>
  meetings.map((meeting) =>
    computeCallRecordingIdForFathomMeeting(meeting.recordingId),
  );

const readCallRecordings = async (callRecordingIds: string[]) => {
  const result = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          updatedAt: true,
          deletedAt: true,
          status: true,
          title: true,
          endedAt: true,
        },
      },
    },
  });

  return new Map(
    callRecordingSnapshotsSchema
      .parse(result)
      .callRecordings.edges.map(({ node }) => [node.id, node]),
  );
};

const syncPage = async ({
  syncClient,
  meetings,
}: {
  syncClient: CoreApiClient;
  meetings: Meeting[];
}) => {
  const filterResult = await filterImportableFathomMeetings({
    coreApiClient: syncClient,
    meetings: meetings.map(serializeFathomMeeting),
  });
  const importableRecordingIds = new Set(
    filterResult.importableMeetings.map(({ recordingId }) => recordingId),
  );

  await syncFathomMeetingsToCallRecordings({
    coreApiClient: syncClient,
    meetings: meetings.filter((meeting) =>
      importableRecordingIds.has(meeting.recordingId),
    ),
    connectedAccountId: CONNECTED_ACCOUNT_ID,
  });

  return filterResult;
};

const readCallRecording = async (callRecordingId: string) =>
  (await readCallRecordings([callRecordingId])).get(callRecordingId);

const delayRecordingEnd = (meeting: Meeting): Meeting => ({
  ...meeting,
  recordingEndTime: new Date(meeting.recordingEndTime.getTime() + 5 * 60_000),
});

const markMediaUnavailable = async ({
  syncClient,
  callRecordingIds,
}: {
  syncClient: CoreApiClient;
  callRecordingIds: string[];
}) =>
  syncClient.mutation({
    updateFathomRecordingImports: {
      __args: {
        filter: { id: { in: callRecordingIds } },
        data: { mediaFailureReason: 'no_downloadable_media' },
      },
      id: true,
    },
  });

const settleMedia = async ({
  syncClient,
  callRecordingIds,
}: {
  syncClient: CoreApiClient;
  callRecordingIds: string[];
}) => {
  await markMediaUnavailable({ syncClient, callRecordingIds });

  for (const callRecordingId of callRecordingIds) {
    expect(
      await completeFathomCallRecordingImport({
        coreApiClient: syncClient,
        callRecordingId,
      }),
    ).toBe(true);
  }
};

describe('Fathom call recording sync', () => {
  let syncClient: CoreApiClient;

  beforeEach(async () => {
    vi.resetAllMocks();
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.kvGet.mockResolvedValue(null);
    syncClient = await createFathomApplicationCoreApiClient();
    vi.spyOn(syncClient, 'mutation');
  });

  afterEach(async () => {
    const callRecordingIds = [...createdCallRecordingIds];

    createdCallRecordingIds.clear();

    await syncClient.mutation({
      destroyFathomRecordingImports: {
        __args: { filter: { id: { in: callRecordingIds } } },
        id: true,
      },
    });

    for (const callRecordingId of (
      await readCallRecordings(callRecordingIds)
    ).keys()) {
      await coreApiClient.mutation({
        destroyCallRecording: { __args: { id: callRecordingId }, id: true },
      });
    }
  });

  it('creates a new page in one batch and writes nothing when the completed page is synced again', async () => {
    const meetings = buildMeetings(3);
    const callRecordingIds = getCallRecordingIds(meetings);

    expect(await syncPage({ syncClient, meetings })).toMatchObject({
      deletedMeetingCount: 0,
      upToDateMeetingCount: 0,
    });
    expect(
      vi
        .mocked(syncClient.mutation)
        .mock.calls.map(([request]: [object]) => Object.keys(request)),
    ).toEqual([['createCallRecordings'], ['createFathomRecordingImports']]);
    expect(
      mocks.enqueueJobs.mock.calls
        .map(([input]) => input)
        .filter(
          (input) =>
            input.logicFunctionUniversalIdentifier ===
            FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
        )
        .flatMap((input) => input.payloads),
    ).toEqual(callRecordingIds.map((callRecordingId) => ({ callRecordingId })));

    await settleMedia({ syncClient, callRecordingIds });

    const callRecordingsBeforeRerun =
      await readCallRecordings(callRecordingIds);

    vi.mocked(syncClient.mutation).mockClear();

    expect(await syncPage({ syncClient, meetings })).toMatchObject({
      importableMeetings: [],
      upToDateMeetingCount: 3,
    });
    expect(syncClient.mutation).not.toHaveBeenCalled();
    expect(await readCallRecordings(callRecordingIds)).toEqual(
      callRecordingsBeforeRerun,
    );
  });

  it('neither resurrects nor updates a recording the user deleted', async () => {
    const meetings = buildMeetings(1);
    const [callRecordingId] = getCallRecordingIds(meetings);

    await syncPage({ syncClient, meetings });
    await coreApiClient.mutation({
      deleteCallRecording: { __args: { id: callRecordingId }, id: true },
    });

    const [deletedCallRecording] = (
      await readCallRecordings([callRecordingId])
    ).values();

    vi.mocked(syncClient.mutation).mockClear();

    expect(await syncPage({ syncClient, meetings })).toMatchObject({
      importableMeetings: [],
      deletedMeetingCount: 1,
    });
    expect(
      await syncFathomMeetingsToCallRecordings({
        coreApiClient: syncClient,
        meetings,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      }),
    ).toEqual([
      {
        callRecordingId,
        skipped: true,
        reason: 'The call recording has been deleted',
      },
    ]);
    expect(syncClient.mutation).not.toHaveBeenCalled();

    await expect(
      syncFathomMeetingsToCallRecordings({
        coreApiClient: syncClient,
        meetings,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        callRecordingSyncStates: new Map(),
      }),
    ).rejects.toThrow();
    expect(
      vi
        .mocked(syncClient.mutation)
        .mock.calls.map(([request]: [object]) => Object.keys(request)),
    ).toEqual([['createCallRecording']]);
    expect(await readCallRecordings([callRecordingId])).toEqual(
      new Map([[callRecordingId, deletedCallRecording]]),
    );
  });

  it('counts a completed recording as up to date only when its transcript has entries', async () => {
    const meetings = buildMeetings(2);
    const [transcribedMeeting, untranscribedMeeting] = meetings;

    for (const { meeting, transcript } of [
      {
        meeting: transcribedMeeting,
        transcript: mapFathomTranscriptToEntries(TRANSCRIPT),
      },
      { meeting: untranscribedMeeting, transcript: [] },
    ]) {
      const callRecordingId = computeCallRecordingIdForFathomMeeting(
        meeting.recordingId,
      );

      await coreApiClient.mutation({
        createCallRecording: {
          __args: {
            data: {
              id: callRecordingId,
              title: meeting.meetingTitle,
              status: 'COMPLETED',
              recordingRequestStatus: 'REQUESTED',
              startedAt: meeting.recordingStartTime.toISOString(),
              endedAt: meeting.recordingEndTime.toISOString(),
              summary: { markdown: 'Renewal', blocknote: null },
              transcript,
            },
          },
          id: true,
        },
      });
      await syncClient.mutation({
        createFathomRecordingImport: {
          __args: {
            data: {
              id: callRecordingId,
              callRecordingId,
              recordingId: String(meeting.recordingId),
              connectedAccountId: CONNECTED_ACCOUNT_ID,
              mediaFailureReason: 'no_downloadable_media',
            },
          },
          id: true,
        },
      });
    }

    expect(
      await filterImportableFathomMeetings({
        coreApiClient: syncClient,
        meetings: meetings.map(serializeFathomMeeting),
      }),
    ).toEqual({
      importableMeetings: [serializeFathomMeeting(untranscribedMeeting)],
      deletedMeetingCount: 0,
      upToDateMeetingCount: 1,
    });
  });

  it('still creates the rest of a batch when one recording already exists', async () => {
    const meetings = buildMeetings(3);
    const [existingCallRecordingId, ...newCallRecordingIds] =
      getCallRecordingIds(meetings);

    await syncPage({ syncClient, meetings: meetings.slice(0, 1) });

    const existingCallRecording = await readCallRecording(
      existingCallRecordingId,
    );

    vi.mocked(syncClient.mutation).mockClear();

    expect(
      await syncFathomMeetingsToCallRecordings({
        coreApiClient: syncClient,
        meetings,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        callRecordingSyncStates: new Map(),
      }),
    ).toEqual([
      expect.objectContaining({
        callRecordingId: existingCallRecordingId,
        created: false,
      }),
      ...newCallRecordingIds.map((callRecordingId) =>
        expect.objectContaining({ callRecordingId, created: true }),
      ),
    ]);
    expect(
      vi
        .mocked(syncClient.mutation)
        .mock.calls.slice(0, 4)
        .map(([request]: [object]) => Object.keys(request)),
    ).toEqual([
      ['createCallRecordings'],
      ['createCallRecording'],
      ['createCallRecording'],
      ['createCallRecording'],
    ]);
    expect([...(await readCallRecordings(newCallRecordingIds)).keys()]).toEqual(
      expect.arrayContaining(newCallRecordingIds),
    );
    expect(await readCallRecording(existingCallRecordingId)).toEqual(
      existingCallRecording,
    );
  });

  it('never completes a recording without transcript entries or with media still pending', async () => {
    const meetings = buildMeetings(2);
    const [untranscribedCallRecordingId, pendingMediaCallRecordingId] =
      getCallRecordingIds(meetings);

    await syncPage({ syncClient, meetings });
    await coreApiClient.mutation({
      updateCallRecording: {
        __args: { id: untranscribedCallRecordingId, data: { transcript: [] } },
        id: true,
      },
    });
    await markMediaUnavailable({
      syncClient,
      callRecordingIds: [untranscribedCallRecordingId],
    });

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient: syncClient,
        callRecordingId: untranscribedCallRecordingId,
      }),
    ).toBe(false);

    await syncFathomMeetingsToCallRecordings({
      coreApiClient: syncClient,
      meetings: [{ ...meetings[0], transcript: [] }],
      connectedAccountId: CONNECTED_ACCOUNT_ID,
    });

    expect(await readCallRecording(untranscribedCallRecordingId)).toMatchObject(
      { status: 'PROCESSING' },
    );

    vi.mocked(syncClient.mutation).mockClear();

    expect(
      await completeFathomCallRecordingImport({
        coreApiClient: syncClient,
        callRecordingId: pendingMediaCallRecordingId,
      }),
    ).toBe(false);
    expect(syncClient.mutation).not.toHaveBeenCalled();
    expect(await readCallRecording(pendingMediaCallRecordingId)).toMatchObject({
      status: 'PROCESSING',
    });
  });

  it('updates and completes an existing incomplete recording from the state it read', async () => {
    const [meeting] = buildMeetings(1);
    const [callRecordingId] = getCallRecordingIds([meeting]);
    const updatedMeeting = delayRecordingEnd(meeting);

    await syncPage({ syncClient, meetings: [meeting] });
    await markMediaUnavailable({
      syncClient,
      callRecordingIds: [callRecordingId],
    });

    expect(
      await syncFathomMeetingsToCallRecordings({
        coreApiClient: syncClient,
        meetings: [updatedMeeting],
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        callRecordingSyncStates: await findCallRecordingSyncStates({
          coreApiClient: syncClient,
          callRecordingIds: [callRecordingId],
        }),
      }),
    ).toEqual([expect.objectContaining({ callRecordingId, created: false })]);

    const callRecording = await readCallRecording(callRecordingId);

    expect(callRecording?.status).toBe('COMPLETED');
    expect(Date.parse(callRecording?.endedAt ?? '')).toBe(
      updatedMeeting.recordingEndTime.getTime(),
    );
  });

  it('does not overwrite a change made after the recording state was read', async () => {
    const [meeting] = buildMeetings(1);
    const [callRecordingId] = getCallRecordingIds([meeting]);

    await syncPage({ syncClient, meetings: [meeting] });

    const callRecordingSyncStates = await findCallRecordingSyncStates({
      coreApiClient: syncClient,
      callRecordingIds: [callRecordingId],
    });

    await coreApiClient.mutation({
      updateCallRecording: {
        __args: { id: callRecordingId, data: { title: 'Renewal follow-up' } },
        id: true,
      },
    });

    const renamedCallRecording = await readCallRecording(callRecordingId);

    await expect(
      syncFathomMeetingsToCallRecordings({
        coreApiClient: syncClient,
        meetings: [delayRecordingEnd(meeting)],
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        callRecordingSyncStates,
      }),
    ).rejects.toThrow(
      'Fathom recording changed during import; retry the import',
    );
    expect(await readCallRecording(callRecordingId)).toEqual(
      renamedCallRecording,
    );
  });
});
