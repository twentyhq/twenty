import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { parseSignedGranolaWebhookEvent } from 'src/logic-functions/utils/parse-signed-granola-webhook-event.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';
import { syncGranolaPersonalNoteOrThrow } from 'src/logic-functions/utils/sync-granola-personal-note-or-throw.util';

export const granolaPersonalWebhookHandler = async ({
  routePayload,
  receivedAt,
  connectionId,
}: {
  routePayload: RoutePayload<unknown>;
  receivedAt: number;
  connectionId: string;
}) => {
  const registration = GRANOLA_PERSONAL_WEBHOOK_REGISTRATION_SCHEMA.safeParse(
    await kv.get(getGranolaPersonalWebhookKey(connectionId)),
  );

  if (!registration.success) {
    return { success: false, error: 'Unknown Granola registration' };
  }

  const webhook = registration.data;
  const parsed = parseSignedGranolaWebhookEvent({
    routePayload,
    receivedAt,
    signingSecret: webhook.signingSecret,
  });

  if (!isDefined(parsed.event)) {
    return { success: false, error: parsed.error };
  }

  try {
    const result = await syncGranolaPersonalNoteOrThrow({
      scope: { connectionId, userWorkspaceId: webhook.userWorkspaceId },
      apiKeyFingerprint: webhook.apiKeyFingerprint,
      noteId: parsed.event.note_id,
    });

    return { success: true, ...result };
  } catch (error) {
    rethrowKnownOrWrapGranolaError({
      operation: 'Personal note synchronization',
      error,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-webhook',
  description:
    'Imports a signed Granola note event for a member’s opted-in folders.',
  timeoutSeconds: 900,
  handler: granolaPersonalWebhookHandler,
});
