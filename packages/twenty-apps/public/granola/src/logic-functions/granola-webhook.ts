import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PENDING_REGISTRATION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GRANOLA_WEBHOOK_PAYLOAD_SCHEMA } from 'src/logic-functions/types/granola-api.type';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { buildRetryableGranolaError } from 'src/logic-functions/utils/build-retryable-granola-error.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { parseJsonOrUndefined } from 'src/logic-functions/utils/parse-json-or-undefined.util';
import { syncGranolaNoteToCallRecordingOrThrow } from 'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util';
import { verifyStandardWebhookSignature } from 'src/logic-functions/utils/verify-standard-webhook-signature.util';

export const granolaWebhookHandler = async ({
  routePayload,
  receivedAt,
}: {
  routePayload: RoutePayload<unknown>;
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
  const result = await syncGranolaNoteToCallRecordingOrThrow({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    client: createGranolaClientOrThrow(),
    noteId: parsed.data.note_id,
  }).catch((error: unknown) => {
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
