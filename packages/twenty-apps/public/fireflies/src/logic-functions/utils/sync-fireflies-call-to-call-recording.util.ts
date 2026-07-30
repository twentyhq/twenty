import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import { CALL_RECORDING_REQUEST_STATUS } from 'src/logic-functions/constants/call-recording-request-status.constant';
import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import { findCallRecordingFieldStatesOrThrow } from 'src/logic-functions/data/find-call-recording-field-states-or-throw.util';
import { type CallRecordingFieldState } from 'src/logic-functions/types/call-recording-field-state.type';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type FirefliesSyncableField } from 'src/logic-functions/types/fireflies-syncable-field.type';
import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import { type SyncFirefliesCallResult } from 'src/logic-functions/types/sync-fireflies-call-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { fetchFirefliesSummary } from 'src/logic-functions/utils/fetch-fireflies-summary';
import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event';
import { formatSummaryAsMarkdown } from 'src/logic-functions/utils/format-summary-as-markdown';
import { mapFirefliesSentencesToTranscriptEntries } from 'src/logic-functions/utils/map-fireflies-sentences-to-transcript-entries.util';
import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

const MINUTES_TO_MILLISECONDS = 60_000;

const buildTimestampFields = (
  transcript: FirefliesTranscript,
): Pick<CallRecordingSyncFields, 'startedAt' | 'endedAt'> => {
  const dateMs = transcript.date;

  if (!isDefined(dateMs) || !Number.isFinite(dateMs)) {
    return {};
  }

  const startedAt = new Date(dateMs).toISOString();

  // Fireflies duration is in minutes.
  const durationMinutes = transcript.duration;

  if (!isDefined(durationMinutes) || !Number.isFinite(durationMinutes)) {
    return { startedAt };
  }

  return {
    startedAt,
    endedAt: new Date(
      dateMs + durationMinutes * MINUTES_TO_MILLISECONDS,
    ).toISOString(),
  };
};

export const syncFirefliesCallToCallRecording = async ({
  apiKey,
  coreApiClient,
  transcriptId,
  field,
  callRecordingFieldState,
}: {
  apiKey: string;
  coreApiClient: CoreApiClient;
  transcriptId: string;
  field: FirefliesSyncableField;
  callRecordingFieldState: CallRecordingFieldState | undefined;
}): Promise<SyncFirefliesCallResult> => {
  const fetchResult =
    field === 'transcript'
      ? await fetchFirefliesTranscript({ apiKey, transcriptId })
      : await fetchFirefliesSummary({ apiKey, transcriptId });

  if (!fetchResult.ok) {
    return {
      status: 'error',
      field,
      error: fetchResult.errorMessage,
      httpStatus: fetchResult.status,
    };
  }

  const firefliesTranscript = fetchResult.data;

  const fieldUpdate = buildFieldUpdate({ field, firefliesTranscript });

  if (field === 'transcript' && fieldUpdate.empty) {
    return { status: 'skipped', field, reason: fieldUpdate.reason };
  }

  if (
    fieldUpdate.empty &&
    callRecordingFieldState?.status !== CALL_RECORDING_STATUS.COMPLETED
  ) {
    return { status: 'skipped', field, reason: fieldUpdate.reason };
  }

  const match = await findMatchingCalendarEvent({
    client: coreApiClient,
    transcript: firefliesTranscript,
  });
  const calendarEventId = match.matched ? match.calendarEventId : undefined;

  const callRecordingId = computeCallRecordingIdForFirefliesMeeting(
    firefliesTranscript.id,
  );

  const title = firefliesTranscript.title?.trim();
  const isCallRecordingComplete =
    !fieldUpdate.empty &&
    (field === 'transcript'
      ? (callRecordingFieldState?.isSummaryFilled ?? false)
      : (callRecordingFieldState?.isTranscriptFilled ?? false));
  const targetStatus = isCallRecordingComplete
    ? CALL_RECORDING_STATUS.COMPLETED
    : CALL_RECORDING_STATUS.PROCESSING;
  const sharedFields: CallRecordingSyncFields = {
    ...(isNonEmptyString(title) ? { title } : {}),
    externalRecordingId: firefliesTranscript.id,
    ...buildTimestampFields(firefliesTranscript),
    ...(isDefined(calendarEventId) ? { calendarEventId } : {}),
    status: targetStatus,
    ...(fieldUpdate.empty ? {} : fieldUpdate.fields),
  };

  try {
    const upsertResult = await upsertCallRecordingOrThrow({
      coreApiClient,
      callRecordingId,
      createFields: {
        ...sharedFields,
        recordingRequestStatus: CALL_RECORDING_REQUEST_STATUS.REQUESTED,
      },
      updateFields: sharedFields,
    });

    await completeCallRecordingIfBothFirefliesFieldsAreFilled({
      coreApiClient,
      callRecordingId: upsertResult.callRecordingId,
      currentStatus: sharedFields.status,
    });

    if (fieldUpdate.empty) {
      return { status: 'skipped', field, reason: fieldUpdate.reason };
    }

    return {
      status: 'updated',
      field,
      callRecordingId: upsertResult.callRecordingId,
      calendarEventId,
      created: upsertResult.created,
    };
  } catch (error) {
    return {
      status: 'error',
      field,
      error: `Failed to upsert CallRecording ${callRecordingId} for Fireflies transcript ${transcriptId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

const buildFieldUpdate = ({
  field,
  firefliesTranscript,
}: {
  field: FirefliesSyncableField;
  firefliesTranscript: FirefliesTranscript;
}):
  | { empty: false; fields: CallRecordingSyncFields }
  | { empty: true; reason: string } => {
  if (field === 'transcript') {
    const entries = mapFirefliesSentencesToTranscriptEntries(
      firefliesTranscript.sentences,
    );

    if (!isNonEmptyArray(entries)) {
      return {
        empty: true,
        reason:
          'Fireflies returned no transcript sentences for this meeting; nothing to sync.',
      };
    }

    return {
      empty: false,
      fields: { transcript: entries },
    };
  }

  if (!isDefined(firefliesTranscript.summary)) {
    const summaryStatus = firefliesTranscript.meeting_info?.summary_status;

    if (summaryStatus === 'failed' || summaryStatus === 'skipped') {
      return {
        empty: false,
        fields: {},
      };
    }

    return {
      empty: true,
      reason:
        'Fireflies returned no summary content for this meeting; nothing to sync.',
    };
  }

  return {
    empty: false,
    fields: {
      summary: {
        markdown: formatSummaryAsMarkdown(firefliesTranscript),
        blocknote: null,
      },
    },
  };
};

const completeCallRecordingIfBothFirefliesFieldsAreFilled = async ({
  coreApiClient,
  callRecordingId,
  currentStatus,
}: {
  coreApiClient: CoreApiClient;
  callRecordingId: string;
  currentStatus: CallRecordingSyncFields['status'];
}): Promise<void> => {
  if (currentStatus === CALL_RECORDING_STATUS.COMPLETED) {
    return;
  }

  const callRecordingFieldStates = await findCallRecordingFieldStatesOrThrow({
    coreApiClient,
    callRecordingIds: [callRecordingId],
  });
  const callRecordingFieldState = callRecordingFieldStates.get(callRecordingId);

  if (
    !isDefined(callRecordingFieldState) ||
    !callRecordingFieldState.isTranscriptFilled ||
    !callRecordingFieldState.isSummaryFilled
  ) {
    return;
  }

  await coreApiClient.mutation({
    updateCallRecording: {
      __args: {
        id: callRecordingId,
        data: { status: CALL_RECORDING_STATUS.COMPLETED },
      },
      id: true,
    },
  });
};
