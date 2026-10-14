import { isNonEmptyArray } from '@sniptt/guards';
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

export const importTeamsTranscriptHistoryPageOrThrow = async ({
  accessToken,
  coreApiClient,
  transcripts,
  importedSince,
  isRunActive,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  transcripts: TeamsOccurrenceTranscript[];
  importedSince: string;
  isRunActive: () => Promise<boolean>;
}): Promise<TeamsTranscriptHistoryPageCounts> => {
  const pageTranscripts = [
    ...new Map(
      transcripts.map((occurrenceTranscript) => {
        const callRecordingId = computeCallRecordingIdForTeamsTranscript(
          occurrenceTranscript.transcript.id,
        );

        return [callRecordingId, { ...occurrenceTranscript, callRecordingId }];
      }),
    ).values(),
  ];
  const {
    deletedCallRecordingIds,
    completedCallRecordingIds,
    importedCallRecordingIds,
  } = await findDeletedAndCompletedCallRecordingIdsOrThrow({
    coreApiClient,
    callRecordingIds: pageTranscripts.map(
      ({ callRecordingId }) => callRecordingId,
    ),
    importedSince,
  });
  const importableTranscripts = pageTranscripts.filter(
    ({ callRecordingId }) =>
      !deletedCallRecordingIds.has(callRecordingId) &&
      !completedCallRecordingIds.has(callRecordingId) &&
      !importedCallRecordingIds.has(callRecordingId),
  );
  const calendarEventIds = await findTeamsCalendarEventIdsOrThrow({
    accessToken,
    coreApiClient,
    references: importableTranscripts
      .map(({ calendarReference }) => calendarReference)
      .filter(isDefined),
  });
  let importedCount = importedCallRecordingIds.size;
  let skippedCount =
    deletedCallRecordingIds.size + completedCallRecordingIds.size;
  let unavailableCount = 0;

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
      const transcriptEntries = isDefined(transcriptContent)
        ? mapTeamsTranscriptToEntries(transcriptContent)
        : [];

      if (!isNonEmptyArray(transcriptEntries)) {
        unavailableCount += 1;
        continue;
      }

      callRecordings.push({
        id: callRecordingId,
        ...toCallRecordingData(
          buildTeamsCallRecordingSyncFields({
            meeting,
            transcript,
            transcriptEntries,
            calendarEventId: isDefined(calendarReference)
              ? calendarEventIds.get(calendarReference.eventExternalId)
              : undefined,
          }),
        ),
      });
    }

    // The batch upsert would bring back a recording deleted while it downloaded.
    const callRecordingIdsBeforeWrite =
      await findDeletedAndCompletedCallRecordingIdsOrThrow({
        coreApiClient,
        callRecordingIds: callRecordings.map(({ id }) => id),
      });
    const upsertableCallRecordings = callRecordings.filter(
      ({ id }) =>
        !callRecordingIdsBeforeWrite.deletedCallRecordingIds.has(id) &&
        !callRecordingIdsBeforeWrite.completedCallRecordingIds.has(id),
    );

    skippedCount += callRecordings.length - upsertableCallRecordings.length;

    if (upsertableCallRecordings.length === 0) {
      continue;
    }

    if (!(await isRunActive())) {
      break;
    }

    await coreApiClient.mutation({
      createCallRecordings: {
        __args: { data: upsertableCallRecordings, upsert: true },
        id: true,
      },
    });
    importedCount += upsertableCallRecordings.length;
  }

  return {
    transcriptCount: 0,
    alreadyImportedCount: 0,
    deletedCount: 0,
    importedCount,
    skippedCount,
    unavailableCount,
  };
};
