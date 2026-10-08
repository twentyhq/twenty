import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PENDING_REGISTRATION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import {
  GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
  GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GRANOLA_WEBHOOK_PAYLOAD_SCHEMA } from 'src/logic-functions/types/granola-api.type';
import { type GranolaBackfillNotePayload } from 'src/logic-functions/types/granola-backfill-note-payload.type';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { GranolaUnavailableError } from 'src/logic-functions/types/granola-unavailable-error';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';
import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { enqueueGranolaDeferredWebhookNoteOrThrow } from 'src/logic-functions/utils/enqueue-granola-deferred-webhook-note-or-throw.util';
import { enqueueGranolaRetryOrThrow } from 'src/logic-functions/utils/enqueue-granola-retry-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { isGranolaFolderSelectionPending } from 'src/logic-functions/utils/is-granola-folder-selection-pending.util';
import { parseJsonOrUndefined } from 'src/logic-functions/utils/parse-json-or-undefined.util';
import { reserveGranolaNoteImportSlotsOrThrow } from 'src/logic-functions/utils/reserve-granola-note-import-slots-or-throw.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';
import { verifyStandardWebhookSignature } from 'src/logic-functions/utils/verify-standard-webhook-signature.util';

export const granolaWebhookHandler = async ({
  routePayload,
  receivedAt,
}: {
  routePayload: Pick<
    RoutePayload<unknown>,
    'queryStringParameters' | 'rawBody' | 'headers'
  >;
  receivedAt: number;
}) => {
  const registrationId = routePayload.queryStringParameters?.registrationId;
  const registration = await kv.get<GranolaWebhookRegistration>(
    GRANOLA_WEBHOOK_REGISTRATION_KEY,
  );
  if (registration?.registrationId !== registrationId) {
    const pendingId = await kv.get<string>(GRANOLA_PENDING_REGISTRATION_KEY);
    if (pendingId === registrationId) {
      throw new RetryableLogicFunctionError(
        'Granola webhook registration is still being saved.',
      );
    }
  }
  const apiKey = process.env[GRANOLA_API_KEY_ENV_VAR_NAME];
  if (
    !isDefined(registration) ||
    registration.registrationId !== registrationId ||
    !isNonEmptyString(apiKey) ||
    getGranolaApiKeyFingerprint(apiKey) !== registration.apiKeyFingerprint
  ) {
    return {
      success: false,
      error: 'Unknown Granola registration',
    };
  }
  const rawBody = routePayload.rawBody;
  const webhookId = routePayload.headers['webhook-id'];
  const timestamp = routePayload.headers['webhook-timestamp'];
  const signature = routePayload.headers['webhook-signature'];
  if (
    !isNonEmptyString(rawBody) ||
    !isNonEmptyString(webhookId) ||
    !isNonEmptyString(timestamp) ||
    !isNonEmptyString(signature) ||
    !verifyStandardWebhookSignature({
      signingSecret: registration.signingSecret,
      webhookId,
      timestamp,
      signature,
      rawBody,
      receivedAt,
    })
  ) {
    return { success: false, error: 'Invalid Granola webhook signature' };
  }
  const parsed = GRANOLA_WEBHOOK_PAYLOAD_SCHEMA.safeParse(
    parseJsonOrUndefined(rawBody),
  );
  if (!parsed.success || parsed.data.event_id !== webhookId) {
    return { success: false, error: 'Invalid Granola webhook event' };
  }
  if (await isGranolaFolderSelectionPending()) {
    await enqueueGranolaDeferredWebhookNoteOrThrow({
      registrationId: registration.registrationId,
      noteId: parsed.data.note_id,
      deferredWebhook: { eventId: parsed.data.event_id, deferralCount: 0 },
    });

    return { success: true, deferred: true };
  }
  const result = await syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient: createApplicationCoreApiClient(),
    client: createGranolaClientOrThrow(),
    noteId: parsed.data.note_id,
  }).catch(async (error: unknown) => {
    if (error instanceof GranolaUnavailableError) {
      const notePayload: GranolaBackfillNotePayload = {
        registrationId: registration.registrationId,
        noteId: parsed.data.note_id,
        deferredWebhook: { eventId: parsed.data.event_id, deferralCount: 0 },
      };
      const schedule = await reserveGranolaNoteImportSlotsOrThrow({
        noteCount: 1,
        notBeforeDelayMilliseconds: error.retryAfterMilliseconds,
      });

      await enqueueGranolaRetryOrThrow({
        logicFunctionUniversalIdentifier:
          GRANOLA_BACKFILL_NOTE_UNIVERSAL_IDENTIFIER,
        prefix: 'granola-webhook-note',
        payload: notePayload,
        delayMs: schedule.noteDelays[0],
      });

      return { deferred: true };
    }
    if (
      error instanceof GranolaApiError ||
      error instanceof GranolaInvalidResponseError ||
      error instanceof GranolaTranscriptLimitError
    ) {
      return { skipped: true, reason: error.message };
    }
    if (error instanceof RetryableLogicFunctionError) {
      throw error;
    }
    throw buildRetryableGranolaError({
      operation: 'Note synchronization',
      error,
    });
  });
  return { success: true, ...result };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'granola-webhook',
  description:
    'Verifies signed Granola events and synchronizes notes into Call Recordings.',
  timeoutSeconds: 900,
  handler: granolaWebhookHandler,
});
