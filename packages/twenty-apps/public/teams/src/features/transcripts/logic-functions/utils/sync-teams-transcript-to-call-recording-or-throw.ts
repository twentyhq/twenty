import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { downloadMeetingTranscriptContent } from 'src/features/transcripts/logic-functions/utils/download-meeting-transcript-content';
import { getMeetingById } from 'src/features/transcripts/logic-functions/utils/get-meeting-by-id';
import { getMeetingTranscript } from 'src/features/transcripts/logic-functions/utils/get-meeting-transcript';
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
  created: boolean;
  skipped: boolean;
}> => {
  const [meeting, transcript, transcriptContent] = await Promise.all([
    getMeetingById({ accessToken, meetingId }),
    getMeetingTranscript({ accessToken, meetingId, transcriptId }),
    downloadMeetingTranscriptContent({ accessToken, meetingId, transcriptId }),
  ]);
  const transcriptEntries = mapTeamsTranscriptToEntries(transcriptContent);
  const callRecordingId = computeCallRecordingIdForTeamsTranscript(
    transcript.id,
  );
  const title = meeting.subject?.trim();
  const result = await upsertCallRecordingOrThrow({
    coreApiClient,
    callRecordingId,
    fields: {
      ...(isNonEmptyString(title) ? { title } : {}),
      status: isNonEmptyArray(transcriptEntries) ? 'COMPLETED' : 'PROCESSING',
      externalRecordingId: transcript.id,
      ...(isNonEmptyString(transcript.createdDateTime)
        ? { startedAt: transcript.createdDateTime }
        : {}),
      ...(isNonEmptyString(transcript.endDateTime)
        ? { endedAt: transcript.endDateTime }
        : {}),
      ...(isNonEmptyArray(transcriptEntries)
        ? { transcript: transcriptEntries }
        : {}),
    },
  });

  return { callRecordingId, ...result };
};
