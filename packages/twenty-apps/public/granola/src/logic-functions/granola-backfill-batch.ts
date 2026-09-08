import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { GRANOLA_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaBackfillBatchPayload } from 'src/logic-functions/types/granola-backfill-batch-payload.type';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { isGranolaJobInRegistrationScope } from 'src/logic-functions/utils/is-granola-job-in-registration-scope.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

export const granolaBackfillBatchHandler = async (
  payload: GranolaBackfillBatchPayload,
) => {
  try {
    const registration = await findGranolaRegistrationForCurrentKey();

    if (
      !isGranolaJobInRegistrationScope({
        registration,
        registrationId: payload.registrationId,
        folderId: payload.folderId,
      })
    ) {
      return { success: true, skipped: true };
    }

    const coreApiClient = new CoreApiClient({ runAs: 'application' });
    const client = createGranolaClientOrThrow();
    const results = [];

    for (const noteId of payload.noteIds) {
      try {
        results.push(
          await syncGranolaNoteToCallRecordingOrThrow({
            coreApiClient,
            client,
            noteId,
          }),
        );
      } catch (error) {
        if (
          error instanceof GranolaInvalidResponseError ||
          error instanceof GranolaTranscriptLimitError ||
          (error instanceof GranolaApiError &&
            [403, 404].includes(error.status))
        ) {
          console.error(
            `[granola] Skipped unreadable note ${noteId}: ${error.message}`,
          );
          continue;
        }

        throw error;
      }
    }

    return {
      success: true,
      importedNoteCount: results.filter((result) => !result.skipped).length,
    };
  } catch (error) {
    if (
      error instanceof RetryableLogicFunctionError ||
      error instanceof GranolaApiError ||
      error instanceof GranolaInvalidResponseError
    ) {
      throw error;
    }

    throw buildRetryableGranolaError({ operation: 'Note import', error });
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_BACKFILL_BATCH_UNIVERSAL_IDENTIFIER,
  name: 'granola-backfill-batch',
  description:
    'Imports one paced batch of Granola notes while preserving deleted recordings.',
  timeoutSeconds: 900,
  handler: granolaBackfillBatchHandler,
});
