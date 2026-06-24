import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type FirefliesSyncCallInput } from 'src/logic-functions/types/fireflies-sync-call-input.type';
import {
  type FirefliesSyncCallFieldOutcome,
  type FirefliesSyncCallResult,
} from 'src/logic-functions/types/fireflies-sync-call-result.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import {
  type FirefliesSyncableField,
  syncFirefliesFieldToCalendarEvent,
} from 'src/logic-functions/utils/sync-fireflies-field-to-calendar-event';

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

  const client = new CoreApiClient();

  const results = await Promise.all(
    ALL_FIELDS.map((field) =>
      syncFirefliesFieldToCalendarEvent({
        apiKey: apiKeyResult.apiKey,
        client,
        transcriptId,
        field,
      }),
    ),
  );

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

  const calendarEventId = results.find(
    (result) => result.status === 'updated',
  )?.calendarEventId;

  if (updatedFields.length === 0) {
    const skipReasons = fieldOutcomes
      .filter((outcome) => outcome.status === 'skipped')
      .map((outcome) => `${outcome.field}: ${outcome.reason}`);
    const errors = fieldOutcomes
      .filter((outcome) => outcome.status === 'error')
      .map((outcome) => `${outcome.field}: ${outcome.error}`);

    return {
      success: false,
      message: `No fields were updated on the matching CalendarEvent for Fireflies transcript ${transcriptId}.`,
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
          )} for Fireflies transcript ${transcriptId} (with errors on ${partialFailures
            .map((outcome) => outcome.field)
            .join(', ')}).`
        : `Synced ${updatedFields.join(
            ' + ',
          )} for Fireflies transcript ${transcriptId}.`,
    transcriptId,
    calendarEventId,
    updatedFields,
    fieldOutcomes,
  };
};
