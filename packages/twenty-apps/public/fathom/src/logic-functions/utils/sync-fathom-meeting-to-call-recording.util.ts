import { isNonEmptyString } from '@sniptt/guards';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { MAX_FATHOM_TITLE_SUMMARY_CHARACTERS } from 'src/constants/fathom.constant';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type FathomMeetingSyncResult } from 'src/logic-functions/types/fathom-meeting-sync-result.type';
import { buildFathomCallRecordingTitle } from 'src/logic-functions/utils/build-fathom-call-recording-title.util';
import { buildFathomCallRecordingUpsertFields } from 'src/logic-functions/utils/build-fathom-call-recording-upsert-fields.util';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { enqueueFathomCallRecordingTitleGeneration } from 'src/logic-functions/utils/enqueue-fathom-call-recording-title-generation.util';
import { enqueueFathomMediaDownloadRequest } from 'src/logic-functions/utils/enqueue-fathom-media-download-request.util';
import { findCallRecordingSyncStates } from 'src/logic-functions/utils/find-call-recording-sync-states.util';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';
import { formatFathomSummary } from 'src/logic-functions/utils/format-fathom-summary.util';
import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';
import { upsertFathomRecordingImport } from 'src/logic-functions/utils/upsert-fathom-recording-import.util';

export const syncFathomMeetingToCallRecording = async ({
  coreApiClient,
  meeting,
  connectedAccountId,
  retryMedia = false,
  callRecordingSyncStates,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meeting: Meeting;
  connectedAccountId: string;
  retryMedia?: boolean;
  callRecordingSyncStates?: Map<string, CallRecordingSyncState>;
}): Promise<FathomMeetingSyncResult> => {
  const callRecordingId = computeCallRecordingIdForFathomMeeting(
    meeting.recordingId,
  );
  const existingCallRecording = (
    callRecordingSyncStates ??
    (await findCallRecordingSyncStates({
      coreApiClient,
      callRecordingIds: [callRecordingId],
    }))
  ).get(callRecordingId);

  if (existingCallRecording?.isDeleted) {
    return {
      callRecordingId,
      skipped: true,
      reason: 'The call recording has been deleted',
    };
  }

  const transcriptEntries = mapFathomTranscriptToEntries(meeting.transcript);
  const summaryMarkdown = formatFathomSummary({
    summaryMarkdown: meeting.defaultSummary?.markdownFormatted,
    actionItems: meeting.actionItems,
  });
  const calendarEventId = await findMatchingCalendarEvent({
    coreApiClient,
    meeting,
  });
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

  const upsertResult = await upsertCallRecording({
    coreApiClient,
    callRecordingId,
    createFields: {
      ...createCallRecordingFields,
      ...(isNonEmptyString(title) ? { title } : {}),
    },
    updateFields: updateCallRecordingFields,
    expectedUpdatedAt: existingCallRecording?.updatedAt,
  });

  await upsertFathomRecordingImport({
    coreApiClient,
    fathomRecordingImportId: callRecordingId,
    fields: recordingImportFields,
    expectedUpdatedAt: existingCallRecording?.fathomRecordingImportUpdatedAt,
  });

  if (!upsertResult.created) {
    await completeFathomCallRecordingImport({
      coreApiClient,
      callRecordingId,
    });
  }

  const meetingSummary = meeting.defaultSummary?.markdownFormatted?.trim();

  if (
    isNonEmptyString(impromptuTitle) &&
    isNonEmptyString(meetingSummary) &&
    (upsertResult.created || existingCallRecording?.title === title)
  ) {
    await enqueueFathomCallRecordingTitleGeneration({
      callRecordingId,
      expectedTitle: title,
      originalTitle: impromptuTitle,
      summary: meetingSummary.slice(0, MAX_FATHOM_TITLE_SUMMARY_CHARACTERS),
    });
  }

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
