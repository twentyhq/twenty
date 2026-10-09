import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';

import { MAX_FATHOM_TITLE_SUMMARY_CHARACTERS } from 'src/constants/fathom.constant';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type FathomMeetingSyncPlan } from 'src/logic-functions/types/fathom-meeting-sync-plan.type';
import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';
import { buildFathomCallRecordingUpsertFields } from 'src/logic-functions/utils/build-fathom-call-recording-upsert-fields.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';

export const buildFathomMeetingSyncPlan = ({
  meeting,
  existingCallRecording,
  calendarEventId,
  connectedAccountId,
  retryMedia,
}: {
  meeting: Meeting;
  existingCallRecording: CallRecordingSyncState | undefined;
  calendarEventId: string | undefined;
  connectedAccountId: string;
  retryMedia: boolean;
}): FathomMeetingSyncPlan => {
  const transcriptEntries = mapFathomTranscriptToEntries(meeting.transcript);
  const summaryMarkdown = formatFathomSummary({
    summaryMarkdown: meeting.defaultSummary?.markdownFormatted,
    actionItems: meeting.actionItems,
  });
  const callRecordingId = computeCallRecordingIdForFathomMeeting(
    meeting.recordingId,
  );
  const { title, impromptuTitle } = buildFathomCallRecordingTitle(meeting);
  const sharedFields: CallRecordingSyncFields = {
    recordingRequestStatus: 'REQUESTED',
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
  const {
    createCallRecordingFields,
    updateCallRecordingFields,
    recordingImportFields,
    isMediaDownloadRequestNeeded,
  } = buildFathomCallRecordingUpsertFields({
    sharedFields,
    existingCallRecording,
    connectedAccountId,
    callRecordingId,
    recordingId: String(meeting.recordingId),
    retryMedia,
  });
  const meetingSummary = meeting.defaultSummary?.markdownFormatted?.trim();

  return {
    callRecordingId,
    calendarEventId,
    existingCallRecording,
    createCallRecordingFields: {
      ...createCallRecordingFields,
      ...(isNonEmptyString(title) ? { title } : {}),
    },
    updateCallRecordingFields,
    recordingImportFields,
    isMediaDownloadRequestNeeded,
    titleGenerationPayload:
      isNonEmptyString(impromptuTitle) && isNonEmptyString(meetingSummary)
        ? {
            callRecordingId,
            expectedTitle: title,
            originalTitle: impromptuTitle,
            summary: meetingSummary.slice(
              0,
              MAX_FATHOM_TITLE_SUMMARY_CHARACTERS,
            ),
          }
        : undefined,
  };
};
