import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { enqueueFathomMediaDownloadRequest } from 'src/logic-functions/utils/enqueue-fathom-media-download.util';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';
import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';
import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export const syncFathomMeetingToCallRecording = async ({
  coreApiClient,
  meeting,
  connectedAccountId,
  retryMedia = false,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meeting: Meeting;
  connectedAccountId?: string;
  retryMedia?: boolean;
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
    // Clearing the reason is what lets an explicit sync retry media an earlier
    // attempt settled as unavailable.
    ...(retryMedia ? { fathomMediaFailureReason: null } : {}),
  };
  const callRecordingId = computeCallRecordingIdForFathomMeeting(
    meeting.recordingId,
  );
  const upsertResult = await upsertCallRecording({
    coreApiClient,
    callRecordingId,
    fields,
  });

  if (isNonEmptyString(connectedAccountId)) {
    await enqueueFathomMediaDownload({
      coreApiClient,
      connectedAccountId,
      recordingId: meeting.recordingId,
      callRecordingId,
    });
  }

  return {
    callRecordingId,
    calendarEventId,
    created: upsertResult.created,
  };
};

// Media is a separate download Fathom generates in the background. It must not
// cost the transcript and summary already written above, so a failed enqueue is
// logged rather than surfaced to a caller that would retry the whole sync.
const enqueueFathomMediaDownload = async ({
  coreApiClient,
  ...payload
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  connectedAccountId: string;
  recordingId: number;
  callRecordingId: string;
}): Promise<void> => {
  try {
    await enqueueFathomMediaDownloadRequest(payload);
  } catch (error) {
    console.error(
      `[fathom] failed to enqueue the media download for recording ${payload.recordingId}: ${toErrorMessage(error)}`,
    );

    // Nothing else will run for this recording, so the reason is recorded here
    // rather than leaving the media silently missing.
    await recordFathomMediaFailure({
      coreApiClient,
      callRecordingId: payload.callRecordingId,
      reason: FATHOM_MEDIA_FAILURE_REASON.ENQUEUE_FAILED,
    }).catch((recordError: unknown) => {
      console.error(
        `[fathom] failed to record the media enqueue failure for recording ${payload.recordingId}: ${toErrorMessage(recordError)}`,
      );
    });
  }
};
