import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type GraphCallTranscript } from 'src/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/logic-functions/types/graph-online-meeting.type';
import { computeCallRecordingIdForTranscript } from 'src/logic-functions/utils/compute-call-recording-id-for-transcript.util';
import { downloadTranscriptContent } from 'src/logic-functions/utils/download-transcript-content.util';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';
import { getOnlineMeeting } from 'src/logic-functions/utils/get-online-meeting.util';
import { parseVttTranscript } from 'src/logic-functions/utils/parse-vtt-transcript.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export type SyncTranscriptResult = {
  callRecordingId: string;
  calendarEventId?: string;
  created: boolean;
  entryCount: number;
  isSpeakerAttributed: boolean;
};

const resolveTitle = (meeting: GraphOnlineMeeting): string | undefined =>
  isNonEmptyString(meeting.subject) ? meeting.subject.trim() : undefined;

export const syncTranscriptToCallRecording = async ({
  accessToken,
  coreApiClient,
  organizerUserId,
  transcript,
}: {
  accessToken: string;
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  organizerUserId: string;
  transcript: GraphCallTranscript;
}): Promise<SyncTranscriptResult> => {
  if (!isNonEmptyString(transcript.meetingId)) {
    throw new Error(
      `Transcript ${transcript.id} has no meetingId; ad hoc call transcripts are not supported yet`,
    );
  }

  const [meeting, download] = await Promise.all([
    getOnlineMeeting({
      accessToken,
      organizerUserId,
      meetingId: transcript.meetingId,
    }),
    downloadTranscriptContent({
      accessToken,
      transcriptContentUrl: transcript.transcriptContentUrl,
    }),
  ]);
  const transcriptEntries = parseVttTranscript(download.content);
  const calendarEventId = await findMatchingCalendarEvent({
    coreApiClient,
    joinWebUrl: meeting.joinWebUrl,
    startDateTime: meeting.startDateTime,
  });
  const title = resolveTitle(meeting);
  const startedAt = meeting.startDateTime ?? transcript.createdDateTime;
  const endedAt = meeting.endDateTime ?? transcript.endDateTime;
  const fields: CallRecordingSyncFields = {
    ...(isNonEmptyString(title) ? { title } : {}),
    status: transcriptEntries.length > 0 ? 'COMPLETED' : 'PROCESSING',
    recordingRequestStatus: 'REQUESTED',
    externalRecordingId: transcript.id,
    ...(isNonEmptyString(startedAt) ? { startedAt } : {}),
    ...(isNonEmptyString(endedAt) ? { endedAt } : {}),
    ...(transcriptEntries.length === 0
      ? {}
      : { transcript: transcriptEntries }),
    ...(calendarEventId === undefined ? {} : { calendarEventId }),
  };
  const callRecordingId = computeCallRecordingIdForTranscript(transcript.id);
  const upsertResult = await upsertCallRecording({
    coreApiClient,
    callRecordingId,
    fields,
  });

  return {
    callRecordingId,
    calendarEventId,
    created: upsertResult.created,
    entryCount: transcriptEntries.length,
    isSpeakerAttributed: download.isSpeakerAttributed,
  };
};
