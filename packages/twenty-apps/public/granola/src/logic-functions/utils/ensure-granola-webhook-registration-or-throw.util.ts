import { randomUUID } from 'node:crypto';
import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  GRANOLA_PENDING_REGISTRATION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';
import { cleanupPendingGranolaRegistrationOrThrow } from 'src/logic-functions/utils/cleanup-pending-granola-registration-or-throw.util';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { createGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/create-granola-webhook-endpoint-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';
import { repairGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/repair-granola-webhook-endpoint-or-throw.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const ensureGranolaWebhookRegistrationOrThrow =
  async (): Promise<GranolaWebhookRegistration> => {
    const apiKey = process.env[GRANOLA_API_KEY_ENV_VAR_NAME]?.trim();
    const apiUrl = process.env.TWENTY_API_URL;
    if (!isNonEmptyString(apiKey) || !isNonEmptyString(apiUrl)) {
      throw new Error('Granola API key and Twenty server URL are required.');
    }
    const client = createGranolaClientOrThrow({ apiKey });
    const apiKeyFingerprint = getGranolaApiKeyFingerprint(apiKey);
    const existing = await kv.get<GranolaWebhookRegistration>(
      GRANOLA_WEBHOOK_REGISTRATION_KEY,
    );
    const { webhook_endpoints: endpoints } =
      await client.listWebhookEndpoints();
    await cleanupPendingGranolaRegistrationOrThrow({
      client,
      endpoints,
      apiUrl,
    });
    const endpoint = endpoints.find(
      (candidate) => candidate.id === existing?.webhookEndpointId,
    );
    const isExistingKeyCurrent =
      isDefined(existing) && existing.apiKeyFingerprint === apiKeyFingerprint;
    if (isExistingKeyCurrent && isDefined(endpoint)) {
      const repairedEndpoint = await repairGranolaWebhookEndpointOrThrow({
        client,
        endpoint,
        expectedUrl: getGranolaWebhookDestinationUrlOrThrow({
          apiUrl,
          registrationId: existing.registrationId,
        }),
      });
      const registration = {
        ...existing,
        scopes: repairedEndpoint.scopes,
        folderIds: repairedEndpoint.folder_ids,
      };
      await kv.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, registration);
      return registration;
    }
    // Settings removes the key before a new one is added, so a foreign endpoint
    // only appears after an out-of-band variable edit and cannot be deleted here.
    if (!isExistingKeyCurrent && isDefined(endpoint)) {
      console.error(
        `[granola] Endpoint ${endpoint.id} belongs to a replaced API key; remove it in Granola settings.`,
      );
    }
    const registrationId = randomUUID();
    const url = getGranolaWebhookDestinationUrlOrThrow({
      apiUrl,
      registrationId,
    });
    await kv.set(GRANOLA_PENDING_REGISTRATION_KEY, registrationId);
    await kv.set(getGranolaRegistrationClaimKey(registrationId), null, {
      scope: 'SERVER',
    });
    const createdEndpoint = await createGranolaWebhookEndpointOrThrow({
      client,
      url,
      preferredScopes: isExistingKeyCurrent ? existing.scopes : undefined,
      folderIds: existing?.folderIds ?? [],
    });
    const registration: GranolaWebhookRegistration = {
      registrationId,
      webhookEndpointId: createdEndpoint.id,
      signingSecret: createdEndpoint.signing_secret,
      apiKeyFingerprint,
      scopes: createdEndpoint.scopes,
      folderIds: createdEndpoint.folder_ids,
    };
    try {
      await kv.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, registration);
    } catch (error) {
      try {
        await deleteStaleGranolaWebhookEndpointOrThrow({
          client,
          webhookEndpointId: createdEndpoint.id,
        });
        await kv.delete(getGranolaRegistrationClaimKey(registrationId), {
          scope: 'SERVER',
        });
      } catch (rollbackError) {
        console.error(
          `[granola] Could not roll back endpoint ${createdEndpoint.id} after a failed registration save: ${toErrorMessage(rollbackError)}`,
        );
      }
      throw error;
    }
    await kv.delete(GRANOLA_PENDING_REGISTRATION_KEY);
    return registration;
  };
