import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingSyncFields } from 'src/features/transcripts/logic-functions/types/call-recording-sync-fields.type';
import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { type TranscriptEntry } from 'src/features/transcripts/logic-functions/types/transcript-entry.type';

export const buildTeamsCallRecordingSyncFields = ({
  meeting,
  transcript,
  transcriptEntries,
  calendarEventId,
}: {
  meeting: Pick<GraphOnlineMeeting, 'subject'>;
  transcript: GraphCallTranscript;
  transcriptEntries: TranscriptEntry[];
  calendarEventId?: string;
}): CallRecordingSyncFields => {
  const title = meeting.subject?.trim();

  return {
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
    ...(isDefined(calendarEventId) ? { calendarEventId } : {}),
  };
};
