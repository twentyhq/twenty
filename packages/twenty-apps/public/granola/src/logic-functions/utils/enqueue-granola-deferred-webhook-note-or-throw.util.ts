import { GRANOLA_WEBHOOK_DEFERRAL_BASE_DELAY_MILLISECONDS } from 'src/constants/granola-history.constant';
import { GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaBackfillNotePayload } from 'src/logic-functions/types/granola-backfill-note-payload.type';
import { type GranolaDeferredWebhook } from 'src/logic-functions/types/granola-deferred-webhook.type';
import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const enqueueGranolaDeferredWebhookNoteOrThrow = async ({
  registrationId,
  noteId,
  deferredWebhook,
}: {
  registrationId: string;
  noteId: string;
  deferredWebhook: GranolaDeferredWebhook;
}): Promise<void> => {
  const payload: GranolaBackfillNotePayload = {
    registrationId,
    noteId,
    deferredWebhook,
  };

  // Keyed per event: a completed job keeps its id for hours and would swallow a later event for the same note
  await enqueueGranolaJobOrThrow({
    logicFunctionUniversalIdentifier:
      GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
    payload,
    jobId: getGranolaJobId({
      prefix: 'granola-webhook-note',
      identity: payload,
    }),
    delayMs:
      GRANOLA_WEBHOOK_DEFERRAL_BASE_DELAY_MILLISECONDS *
      2 ** deferredWebhook.deferralCount,
  });
};
