import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_UNAVAILABLE_RETRY_LIMIT,
  GRANOLA_WEBHOOK_DEFERRAL_LIMIT,
} from 'src/constants/granola-history.constant';
import { GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaBackfillNotePayload } from 'src/logic-functions/types/granola-backfill-note-payload.type';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { GranolaUnavailableError } from 'src/logic-functions/types/granola-unavailable-error';
import { assertGranolaFolderSelectionReadyOrThrow } from 'src/logic-functions/utils/assert-granola-folder-selection-ready-or-throw.util';
import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { enqueueGranolaDeferredWebhookNoteOrThrow } from 'src/logic-functions/utils/enqueue-granola-deferred-webhook-note-or-throw.util';
import { enqueueGranolaRetryOrThrow } from 'src/logic-functions/utils/enqueue-granola-retry-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { isGranolaFolderSelectionPending } from 'src/logic-functions/utils/is-granola-folder-selection-pending.util';
import { isGranolaJobInRegistrationScope } from 'src/logic-functions/utils/is-granola-job-in-registration-scope.util';
import { reserveGranolaNoteImportSlotsOrThrow } from 'src/logic-functions/utils/reserve-granola-note-import-slots-or-throw.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';

export const granolaBackfillNoteHandler = async (
  payload: GranolaBackfillNotePayload,
) => {
  try {
    const { deferredWebhook } = payload;

    if (
      isDefined(deferredWebhook) &&
      (await isGranolaFolderSelectionPending())
    ) {
      const deferralCount = deferredWebhook.deferralCount + 1;

      if (deferralCount >= GRANOLA_WEBHOOK_DEFERRAL_LIMIT) {
        console.error(
          `[granola] Folder selection still pending, left note ${payload.noteId} to the daily catch-up.`,
        );

        return { success: true, skipped: true };
      }

      await enqueueGranolaDeferredWebhookNoteOrThrow({
        registrationId: payload.registrationId,
        noteId: payload.noteId,
        deferredWebhook: { ...deferredWebhook, deferralCount },
      });

      return { success: true, deferred: true };
    }

    await assertGranolaFolderSelectionReadyOrThrow();
    const registration = await findGranolaRegistrationForCurrentKey();

    if (
      isDefined(deferredWebhook) &&
      registration?.registrationId !== payload.registrationId
    ) {
      return { success: true, skipped: true };
    }

    if (
      !isDefined(deferredWebhook) &&
      !isGranolaJobInRegistrationScope({
        registration,
        registrationId: payload.registrationId,
        folderId: payload.folderId,
      })
    ) {
      return { success: true, skipped: true };
    }

    const coreApiClient = createApplicationCoreApiClient();
    const client = createGranolaClientOrThrow();
    try {
      const result = await syncGranolaNoteToCallRecordingOrThrow({
        coreApiClient,
        client,
        noteId: payload.noteId,
        shouldSkipUnchangedNote: true,
      });

      return {
        success: true,
        importedNoteCount: result.skipped ? 0 : 1,
      };
    } catch (error) {
      if (
        error instanceof GranolaInvalidResponseError ||
        error instanceof GranolaTranscriptLimitError ||
        (error instanceof GranolaApiError && [403, 404].includes(error.status))
      ) {
        console.error(
          `[granola] Skipped unreadable note ${payload.noteId}: ${error.message}`,
        );

        return { success: true, importedNoteCount: 0 };
      }

      if (
        error instanceof GranolaUnavailableError &&
        (payload.retryAttempt ?? 0) < GRANOLA_UNAVAILABLE_RETRY_LIMIT
      ) {
        const schedule = await reserveGranolaNoteImportSlotsOrThrow({
          noteCount: 1,
          notBeforeDelayMilliseconds: error.retryAfterMilliseconds,
        });

        await enqueueGranolaRetryOrThrow({
          logicFunctionUniversalIdentifier:
            GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
          prefix: 'granola-note',
          payload,
          delayMs: schedule.noteDelays[0],
        });

        return { success: true, deferred: true };
      }

      throw error;
    }
  } catch (error) {
    rethrowKnownOrWrapGranolaError({ operation: 'Note import', error });
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-backfill-note',
  description:
    'Imports one paced Granola note while preserving deleted recordings.',
  timeoutSeconds: 900,
  handler: granolaBackfillNoteHandler,
});
