import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';
import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';
import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export const syncFathomMeetingToCallRecording = async ({
  coreApiClient,
  meeting,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meeting: Meeting;
}): Promise<{
  callRecordingId: string;
  calendarEventId?: string;
  created: boolean;
}> => {
  const transcriptEntries = mapFathomTranscriptToEntries(meeting.transcript);
  const summaryMarkdown = formatFathomSummary({
    summaryMarkdown: meeting.defaultSummary?.markdownFormatted,
    actionItems: meeting.actionItems,
  });
  const calendarEventId = await findMatchingCalendarEvent({
    coreApiClient,
    meeting,
  });
  const title = getFathomMeetingTitle(meeting);
  // Fathom exposes no pending state, so a summary still missing when we sync is
  // one it never generated: waiting on it would strand the recording.
  const isComplete = transcriptEntries.length > 0;
  const fields: CallRecordingSyncFields = {
    ...(isNonEmptyString(title) ? { title } : {}),
    status: isComplete ? 'COMPLETED' : 'PROCESSING',
    recordingRequestStatus: 'REQUESTED',
    externalRecordingId: String(meeting.recordingId),
    startedAt: meeting.recordingStartTime.toISOString(),
    endedAt: meeting.recordingEndTime.toISOString(),
    ...(transcriptEntries.length === 0
      ? {}
      : { transcript: transcriptEntries }),
    ...(isNonEmptyString(summaryMarkdown)
      ? { summary: { markdown: summaryMarkdown, blocknote: null } }
      : {}),
    ...(calendarEventId === undefined ? {} : { calendarEventId }),
  };
  const callRecordingId = computeCallRecordingIdForFathomMeeting(
    meeting.recordingId,
  );
  const upsertResult = await upsertCallRecording({
    coreApiClient,
    callRecordingId,
    fields,
  });

  return {
    callRecordingId,
    calendarEventId,
    created: upsertResult.created,
  };
};
