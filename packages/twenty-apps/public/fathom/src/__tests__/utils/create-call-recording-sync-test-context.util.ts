import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { randomInt } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { expect, vi } from 'vitest';
import { z } from 'zod';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { createFathomApplicationCoreApiClient } from 'src/__tests__/utils/create-fathom-application-core-api-client.util';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { filterImportableFathomMeetings } from 'src/logic-functions/utils/filter-importable-fathom-meetings.util';
import { serializeFathomMeeting } from 'src/logic-functions/utils/serialize-fathom-meeting.util';
import { syncFathomMeetingsToCallRecordings } from 'src/logic-functions/utils/sync-fathom-meetings-to-call-recordings.util';

const CONNECTED_ACCOUNT_ID = '9f7e3c1a-5b2d-4e8f-a6c9-0d1b2e3f4a5b';

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

export const createCallRecordingSyncTestContext = () => {
  const coreApiClient = new CoreApiClient();
  const createdCallRecordingIds = new Set<string>();
  let syncClient = coreApiClient;

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

  const markMediaUnavailable = (callRecordingIds: string[]) =>
    syncClient.mutation({
      updateFathomRecordingImports: {
        __args: {
          filter: { id: { in: callRecordingIds } },
          data: { mediaFailureReason: 'no_downloadable_media' },
        },
        id: true,
      },
    });

  const syncMeetings = ({
    meetings,
    callRecordingSyncStates,
  }: {
    meetings: Meeting[];
    callRecordingSyncStates?: Map<string, CallRecordingSyncState>;
  }) =>
    syncFathomMeetingsToCallRecordings({
      coreApiClient: syncClient,
      meetings,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      callRecordingSyncStates,
    });

  return {
    coreApiClient,
    get syncClient() {
      return syncClient;
    },
    setUp: async () => {
      syncClient = await createFathomApplicationCoreApiClient();
      vi.spyOn(syncClient, 'mutation');
    },
    cleanUp: async () => {
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
    },
    buildMeetings: (count: number): Meeting[] =>
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
          transcript: [
            {
              speaker: { displayName: 'Owner' },
              text: 'Let us review the renewal.',
              timestamp: '00:00:05',
            },
          ],
          defaultSummary: { templateName: null, markdownFormatted: 'Renewal' },
        };
      }),
    getCallRecordingIds: (meetings: Meeting[]) =>
      meetings.map((meeting) =>
        computeCallRecordingIdForFathomMeeting(meeting.recordingId),
      ),
    readCallRecordings,
    readCallRecording: async (callRecordingId: string) =>
      (await readCallRecordings([callRecordingId])).get(callRecordingId),
    getMutationNames: () =>
      vi
        .mocked(syncClient.mutation)
        .mock.calls.map(([request]: [object]) => Object.keys(request)),
    clearMutations: () => vi.mocked(syncClient.mutation).mockClear(),
    markMediaUnavailable,
    settleMedia: async (callRecordingIds: string[]) => {
      await markMediaUnavailable(callRecordingIds);

      for (const callRecordingId of callRecordingIds) {
        expect(
          await completeFathomCallRecordingImport({
            coreApiClient: syncClient,
            callRecordingId,
          }),
        ).toBe(true);
      }
    },
    syncMeetings,
    syncMeeting: async ({
      meeting,
      callRecordingSyncStates,
    }: {
      meeting: Meeting;
      callRecordingSyncStates?: Map<string, CallRecordingSyncState>;
    }) => {
      const [result] = await syncMeetings({
        meetings: [meeting],
        callRecordingSyncStates,
      });

      return result;
    },
    syncPage: async (meetings: Meeting[]) => {
      const filterResult = await filterImportableFathomMeetings({
        coreApiClient: syncClient,
        meetings: meetings.map(serializeFathomMeeting),
      });
      const importableRecordingIds = new Set(
        filterResult.importableMeetings.map(({ recordingId }) => recordingId),
      );

      await syncMeetings({
        meetings: meetings.filter((meeting) =>
          importableRecordingIds.has(meeting.recordingId),
        ),
      });

      return filterResult;
    },
  };
};
