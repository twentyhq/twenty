import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_UPSERT_BATCH_SIZE } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-upsert-batch-size';
import { type TeamsOccurrenceTranscript } from 'src/features/transcripts/logic-functions/types/teams-occurrence-transcript.type';
import { type TeamsTranscriptHistoryPageCounts } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-counts.type';
import { buildTeamsCallRecordingSyncFields } from 'src/features/transcripts/logic-functions/utils/build-teams-call-recording-sync-fields';
import { chunkIntoBatches } from 'src/features/transcripts/logic-functions/utils/chunk-into-batches';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { downloadMeetingTranscriptContent } from 'src/features/transcripts/logic-functions/utils/download-meeting-transcript-content';
import { findDeletedAndCompletedCallRecordingIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-deleted-and-completed-call-recording-ids-or-throw';
import { findTeamsCalendarEventIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-calendar-event-ids-or-throw';
import { isUnavailableTeamsTranscriptError } from 'src/features/transcripts/logic-functions/utils/is-unavailable-teams-transcript-error';
import { mapTeamsTranscriptToEntries } from 'src/features/transcripts/logic-functions/utils/map-teams-transcript-to-entries';
import { toCallRecordingData } from 'src/features/transcripts/logic-functions/utils/to-call-recording-data';

const downloadAvailableTranscriptContentOrThrow = async ({
  accessToken,
  meetingId,
  transcriptId,
}: {
  accessToken: string;
  meetingId: string;
  transcriptId: string;
}): Promise<string | undefined> => {
  try {
    return await downloadMeetingTranscriptContent({
      accessToken,
      meetingId,
      transcriptId,
    });
  } catch (error) {
    if (isUnavailableTeamsTranscriptError(error)) {
      return undefined;
    }

    throw error;
  }
};

const findSoftDeletedCallRecordingIdsOrThrow = async ({
  coreApiClient,
  callRecordingIds,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
}): Promise<Set<string>> => {
  const result: {
    callRecordings?: { edges?: { node: { id: string } }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          deletedAt: { is: 'NOT_NULL' },
        },
        first: callRecordingIds.length,
      },
      edges: { node: { id: true } },
    },
  });

  return new Set(
    result.callRecordings?.edges?.map((edge) => edge.node.id) ?? [],
  );
};

export const importTeamsTranscriptHistoryPageOrThrow = async ({
  accessToken,
  coreApiClient,
  transcripts,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  transcripts: TeamsOccurrenceTranscript[];
}): Promise<TeamsTranscriptHistoryPageCounts> => {
  const pageTranscripts = transcripts.map((occurrenceTranscript) => ({
    ...occurrenceTranscript,
    callRecordingId: computeCallRecordingIdForTeamsTranscript(
      occurrenceTranscript.transcript.id,
    ),
  }));
  const { deletedCallRecordingIds, completedCallRecordingIds } =
    await findDeletedAndCompletedCallRecordingIdsOrThrow({
      coreApiClient,
      callRecordingIds: pageTranscripts.map(
        ({ callRecordingId }) => callRecordingId,
      ),
    });
  const importableTranscripts = pageTranscripts.filter(
    ({ callRecordingId }) =>
      !deletedCallRecordingIds.has(callRecordingId) &&
      !completedCallRecordingIds.has(callRecordingId),
  );
  const calendarEventIds = await findTeamsCalendarEventIdsOrThrow({
    accessToken,
    coreApiClient,
    references: importableTranscripts
      .map(({ calendarReference }) => calendarReference)
      .filter(isDefined),
  });
  const unavailableCallRecordingIds: string[] = [];
  const deletedDuringImportCallRecordingIds: string[] = [];

  for (const transcriptBatch of chunkIntoBatches(
    importableTranscripts,
    TEAMS_TRANSCRIPT_HISTORY_UPSERT_BATCH_SIZE,
  )) {
    const callRecordings: (ReturnType<typeof toCallRecordingData> & {
      id: string;
    })[] = [];

    for (const {
      meeting,
      transcript,
      calendarReference,
      callRecordingId,
    } of transcriptBatch) {
      const transcriptContent = await downloadAvailableTranscriptContentOrThrow(
        {
          accessToken,
          meetingId: meeting.id,
          transcriptId: transcript.id,
        },
      );

      if (!isDefined(transcriptContent)) {
        unavailableCallRecordingIds.push(callRecordingId);
        continue;
      }

      const fields = buildTeamsCallRecordingSyncFields({
        meeting,
        transcript,
        transcriptEntries: mapTeamsTranscriptToEntries(transcriptContent),
        calendarEventId: isDefined(calendarReference)
          ? calendarEventIds.get(calendarReference.eventExternalId)
          : undefined,
      });

      callRecordings.push({
        id: callRecordingId,
        ...toCallRecordingData(fields),
      });
    }

    if (callRecordings.length === 0) {
      continue;
    }

    const softDeletedCallRecordingIds =
      await findSoftDeletedCallRecordingIdsOrThrow({
        coreApiClient,
        callRecordingIds: callRecordings.map(({ id }) => id),
      });
    const upsertableCallRecordings = callRecordings.filter(
      ({ id }) => !softDeletedCallRecordingIds.has(id),
    );

    deletedDuringImportCallRecordingIds.push(...softDeletedCallRecordingIds);

    if (upsertableCallRecordings.length > 0) {
      await coreApiClient.mutation({
        createCallRecordings: {
          __args: { data: upsertableCallRecordings, upsert: true },
          id: true,
        },
      });
    }
  }

  return {
    transcriptCount: 0,
    alreadyImportedCount: 0,
    deletedCount: 0,
    importedCount:
      importableTranscripts.length -
      unavailableCallRecordingIds.length -
      deletedDuringImportCallRecordingIds.length,
    skippedCount:
      transcripts.length -
      importableTranscripts.length +
      deletedDuringImportCallRecordingIds.length,
    unavailableCount: unavailableCallRecordingIds.length,
  };
};
