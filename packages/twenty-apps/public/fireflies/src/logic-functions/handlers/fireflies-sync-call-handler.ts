import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import { findCallRecordingFieldStatesOrThrow } from 'src/logic-functions/data/find-call-recording-field-states-or-throw.util';
import { type FirefliesSyncCallInput } from 'src/logic-functions/types/fireflies-sync-call-input.type';
import {
  type FirefliesSyncCallFieldOutcome,
  type FirefliesSyncCallResult,
} from 'src/logic-functions/types/fireflies-sync-call-result.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { type FirefliesSyncableField } from 'src/logic-functions/types/fireflies-syncable-field.type';
import { type SyncFirefliesCallResult } from 'src/logic-functions/types/sync-fireflies-call-result.type';
import { computeCallRecordingIdForFirefliesMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fireflies-meeting';
import { syncFirefliesCallToCallRecording } from 'src/logic-functions/utils/sync-fireflies-call-to-call-recording.util';

const ALL_FIELDS: FirefliesSyncableField[] = ['transcript', 'summary'];

const buildFailure = (
  message: string,
  error: string,
  transcriptId?: string,
): FirefliesSyncCallResult => ({
  success: false,
  message,
  error,
  transcriptId,
});

export const firefliesSyncCallHandler = async (
  parameters: FirefliesSyncCallInput,
): Promise<FirefliesSyncCallResult> => {
  const transcriptId = parameters.transcriptId?.trim();

  if (!isNonEmptyString(transcriptId)) {
    return buildFailure(
      'Failed to sync Fireflies call',
      '`transcriptId` is required.',
    );
  }

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return buildFailure(
      'Fireflies is not configured',
      apiKeyResult.error,
      transcriptId,
    );
  }

  const coreApiClient = new CoreApiClient();
  const callRecordingId =
    computeCallRecordingIdForFirefliesMeeting(transcriptId);
  const callRecordingFieldStates = await findCallRecordingFieldStatesOrThrow({
    coreApiClient,
    callRecordingIds: [callRecordingId],
  });
  const initialCallRecordingFieldState =
    callRecordingFieldStates.get(callRecordingId);

  // Sequential: both fields upsert the same row, concurrent runs would race on the create.
  const results: SyncFirefliesCallResult[] = [];

  for (const field of ALL_FIELDS) {
    const isTranscriptFilled =
      (initialCallRecordingFieldState?.isTranscriptFilled ?? false) ||
      results.some(
        (result) =>
          result.status === 'updated' && result.field === 'transcript',
      );
    const isSummaryFilled =
      (initialCallRecordingFieldState?.isSummaryFilled ?? false) ||
      results.some(
        (result) => result.status === 'updated' && result.field === 'summary',
      );
    const currentCallRecordingFieldState = {
      isTranscriptFilled,
      isSummaryFilled,
      status:
        results.length === 0
          ? initialCallRecordingFieldState?.status
          : isTranscriptFilled && isSummaryFilled
            ? CALL_RECORDING_STATUS.COMPLETED
            : CALL_RECORDING_STATUS.PROCESSING,
    };

    results.push(
      await syncFirefliesCallToCallRecording({
        apiKey: apiKeyResult.apiKey,
        coreApiClient,
        transcriptId,
        field,
        callRecordingFieldState: currentCallRecordingFieldState,
      }),
    );
  }

  const fieldOutcomes: FirefliesSyncCallFieldOutcome[] = results.map(
    (result) => {
      if (result.status === 'skipped') {
        return {
          field: result.field,
          status: 'skipped',
          reason: result.reason,
        };
      }
      if (result.status === 'error') {
        return { field: result.field, status: 'error', error: result.error };
      }
      return { field: result.field, status: 'updated' };
    },
  );

  const updatedFields = fieldOutcomes
    .filter((outcome) => outcome.status === 'updated')
    .map((outcome) => outcome.field);

  const updatedResult = results.find(
    (
      result,
    ): result is Extract<SyncFirefliesCallResult, { status: 'updated' }> =>
      result.status === 'updated',
  );

  if (updatedFields.length === 0) {
    const skipReasons = fieldOutcomes
      .filter((outcome) => outcome.status === 'skipped')
      .map((outcome) => `${outcome.field}: ${outcome.reason}`);
    const errors = fieldOutcomes
      .filter((outcome) => outcome.status === 'error')
      .map((outcome) => `${outcome.field}: ${outcome.error}`);

    return {
      success: false,
      message: `No CallRecording was written for Fireflies transcript ${transcriptId}.`,
      error: [...errors, ...skipReasons].join(' | ') || 'No fields updated.',
      transcriptId,
      fieldOutcomes,
    };
  }

  const partialFailures = fieldOutcomes.filter(
    (outcome) => outcome.status === 'error',
  );

  return {
    success: true,
    message:
      partialFailures.length > 0
        ? `Synced ${updatedFields.join(
            ' + ',
          )} onto the CallRecording for Fireflies transcript ${transcriptId} (with errors on ${partialFailures
            .map((outcome) => outcome.field)
            .join(', ')}).`
        : `Synced ${updatedFields.join(
            ' + ',
          )} onto the CallRecording for Fireflies transcript ${transcriptId}.`,
    transcriptId,
    callRecordingId: updatedResult?.callRecordingId,
    calendarEventId: updatedResult?.calendarEventId,
    updatedFields,
    fieldOutcomes,
  };
};
