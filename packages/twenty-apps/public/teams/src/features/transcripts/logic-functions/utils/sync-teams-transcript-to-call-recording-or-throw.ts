import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/features/transcripts/logic-functions/types/call-recording-sync-fields.type';
import { buildTeamsCallRecordingSyncFields } from 'src/features/transcripts/logic-functions/utils/build-teams-call-recording-sync-fields';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { fetchTeamsTranscriptData } from 'src/features/transcripts/logic-functions/utils/fetch-teams-transcript-data';
import { findTeamsTranscriptCalendarEventIdOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-event-id-or-throw';
import { mapTeamsTranscriptToEntries } from 'src/features/transcripts/logic-functions/utils/map-teams-transcript-to-entries';
import { upsertCallRecordingOrThrow } from 'src/features/transcripts/logic-functions/utils/upsert-call-recording-or-throw';

export const syncTeamsTranscriptToCallRecordingOrThrow = async ({
  accessToken,
  coreApiClient,
  meetingId,
  transcriptId,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meetingId: string;
  transcriptId: string;
}): Promise<{
  callRecordingId: string;
  calendarEventId?: string;
  status: CallRecordingSyncFields['status'];
  created: boolean;
  skipped: boolean;
}> => {
  const { meeting, transcript, transcriptContent } =
    await fetchTeamsTranscriptData({ accessToken, meetingId, transcriptId });
  const transcriptEntries = mapTeamsTranscriptToEntries(transcriptContent);
  const callRecordingId = computeCallRecordingIdForTeamsTranscript(
    transcript.id,
  );
  const calendarEventId = await findTeamsTranscriptCalendarEventIdOrThrow({
    accessToken,
    coreApiClient,
    meeting,
    transcript,
  });
  const fields = buildTeamsCallRecordingSyncFields({
    meeting,
    transcript,
    transcriptEntries,
    calendarEventId,
  });
  const result = await upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId,
    fields,
  });

  return { callRecordingId, calendarEventId, status: fields.status, ...result };
};
