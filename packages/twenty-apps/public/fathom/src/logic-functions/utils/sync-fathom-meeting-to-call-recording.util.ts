import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { buildFathomCallRecordingUpsertFields } from 'src/logic-functions/utils/build-fathom-call-recording-upsert-fields.util';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { enqueueFathomMediaDownloadRequest } from 'src/logic-functions/utils/enqueue-fathom-media-download-request.util';
import { findCallRecordingMediaState } from 'src/logic-functions/utils/find-call-recording-media-state.util';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';
import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';
import { getFathomMeetingTitle } from 'src/logic-functions/utils/get-fathom-meeting-title.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';

export const syncFathomMeetingToCallRecording = async ({
  coreApiClient,
  meeting,
  connectedAccountId,
  retryMedia = false,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meeting: Meeting;
  connectedAccountId: string;
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
  const callRecordingId = computeCallRecordingIdForFathomMeeting(
    meeting.recordingId,
  );
  const existingCallRecording = await findCallRecordingMediaState({
    coreApiClient,
    callRecordingId,
  });
  const sharedFields: CallRecordingSyncFields = {
    ...(isNonEmptyString(title) ? { title } : {}),
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
  const { createFields, updateFields, isMediaDownloadRequestNeeded } =
    buildFathomCallRecordingUpsertFields({
      sharedFields,
      existingCallRecording,
      connectedAccountId,
      retryMedia,
    });
  const upsertResult = await upsertCallRecording({
    coreApiClient,
    callRecordingId,
    createFields,
    updateFields,
    expectedUpdatedAt: existingCallRecording?.updatedAt,
  });

  await completeFathomCallRecordingImport({
    coreApiClient,
    callRecordingId,
  });
  if (upsertResult.created || isMediaDownloadRequestNeeded) {
    await enqueueFathomMediaDownloadRequest({
      callRecordingId,
      connectedAccountId,
    });
  }

  return {
    callRecordingId,
    calendarEventId,
    created: upsertResult.created,
  };
};
