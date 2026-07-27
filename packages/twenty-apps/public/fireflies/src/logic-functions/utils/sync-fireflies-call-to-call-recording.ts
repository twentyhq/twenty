import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'src/utils/is-defined';

import {
  CALL_RECORDING_REQUEST_STATUS,
  CALL_RECORDING_STATUS,
} from 'src/logic-functions/constants/call-recording-status';
import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { fetchFirefliesSummary } from 'src/logic-functions/utils/fetch-fireflies-summary';
import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event';
import { formatSummaryAsMarkdown } from 'src/logic-functions/utils/format-summary-as-markdown';
import { mapFirefliesSentencesToTranscriptEntries } from 'src/logic-functions/utils/map-fireflies-sentences-to-transcript-entries';
import {
  type CallRecordingWriteFields,
  upsertCallRecording,
} from 'src/logic-functions/utils/upsert-call-recording';

export type FirefliesSyncableField = 'transcript' | 'summary';

export type SyncFirefliesCallResult =
  | {
      status: 'updated';
      field: FirefliesSyncableField;
      callRecordingId: string;
      calendarEventId?: string;
      created: boolean;
    }
  | { status: 'skipped'; field: FirefliesSyncableField; reason: string }
  | { status: 'error'; field: FirefliesSyncableField; error: string };

const MINUTES_TO_MILLISECONDS = 60_000;

const buildTimestampFields = (
  transcript: FirefliesTranscript,
): Pick<CallRecordingWriteFields, 'startedAt' | 'endedAt'> => {
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
  client,
  transcriptId,
  field,
}: {
  apiKey: string;
  client: CoreApiClient;
  transcriptId: string;
  field: FirefliesSyncableField;
}): Promise<SyncFirefliesCallResult> => {
  const fetchResult =
    field === 'transcript'
      ? await fetchFirefliesTranscript({ apiKey, transcriptId })
      : await fetchFirefliesSummary({ apiKey, transcriptId });

  if (!fetchResult.ok) {
    return { status: 'error', field, error: fetchResult.errorMessage };
  }

  const firefliesTranscript = fetchResult.data;

  const fieldUpdate = buildFieldUpdate({ field, firefliesTranscript });

  if (fieldUpdate.empty) {
    return { status: 'skipped', field, reason: fieldUpdate.reason };
  }

  const match = await findMatchingCalendarEvent({
    client,
    transcript: firefliesTranscript,
  });
  const calendarEventId = match.matched ? match.calendarEventId : undefined;

  const callRecordingId = computeCallRecordingIdForFirefliesMeeting(
    firefliesTranscript.id,
  );

  const title = firefliesTranscript.title?.trim();
  const sharedFields: CallRecordingWriteFields = {
    ...(isNonEmptyString(title) ? { title } : {}),
    externalRecordingId: firefliesTranscript.id,
    ...buildTimestampFields(firefliesTranscript),
    ...(isDefined(calendarEventId) ? { calendarEventId } : {}),
    ...fieldUpdate.fields,
  };

  try {
    const upsertResult = await upsertCallRecording(client, {
      id: callRecordingId,
      createFields: {
        ...sharedFields,
        recordingRequestStatus: CALL_RECORDING_REQUEST_STATUS.REQUESTED,
        status: sharedFields.status ?? CALL_RECORDING_STATUS.PROCESSING,
      },
      updateFields: sharedFields,
    });

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
        (error as Error).message
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
  | { empty: false; fields: CallRecordingWriteFields }
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
      fields: {
        transcript: entries,
        status: CALL_RECORDING_STATUS.COMPLETED,
      },
    };
  }

  if (!isDefined(firefliesTranscript.summary)) {
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
