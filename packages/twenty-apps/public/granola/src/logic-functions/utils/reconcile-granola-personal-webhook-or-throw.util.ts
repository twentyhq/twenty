import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_REGISTRATION_PREFIX } from 'src/constants/granola-personal-connection.constant';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { createGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/create-granola-webhook-endpoint-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { repairGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/repair-granola-webhook-endpoint-or-throw.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';

export const reconcileGranolaPersonalWebhookOrThrow = async ({
  scope: { connectionId, userWorkspaceId },
  client,
  apiKeyFingerprint,
  folderIds,
}: {
  scope: GranolaPersonalSyncScope;
  client: ReturnType<typeof createGranolaClientOrThrow>;
  apiKeyFingerprint: string;
  folderIds: string[];
}) => {
  if (folderIds.length === 0) {
    await removeGranolaPersonalWebhook({
      connectionId,
      client,
    });

    return { skipped: true };
  }

  const apiUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiUrl)) {
    throw new GranolaWebhookConfigurationError({
      message: 'TWENTY_API_URL is required to register a Granola webhook.',
    });
  }

  const key = getGranolaPersonalWebhookKey(connectionId);
  const registrationId = GRANOLA_PERSONAL_REGISTRATION_PREFIX + connectionId;
  const claimKey = getGranolaRegistrationClaimKey(registrationId);
  const existing = await kv.get<GranolaPersonalWebhookRegistration>(key);
  const url = getGranolaWebhookDestinationUrlOrThrow({
    apiUrl,
    registrationId,
  });
  const { webhook_endpoints: endpoints } = await client.listWebhookEndpoints();
  const currentEndpoint = endpoints.find(
    ({ id }) =>
      existing?.webhookEndpointId === id &&
      existing.apiKeyFingerprint === apiKeyFingerprint,
  );

  if (isDefined(currentEndpoint)) {
    await repairGranolaWebhookEndpointOrThrow({
      client,
      endpoint: currentEndpoint,
      expectedUrl: url,
      folderIds,
    });
    await kv.set(claimKey, null, { scope: 'SERVER' });

    return { skipped: false };
  }

  for (const endpoint of endpoints.filter(
    (candidate) => candidate.url === url,
  )) {
    await deleteStaleGranolaWebhookEndpointOrThrow({
      client,
      webhookEndpointId: endpoint.id,
    });
  }

  const webhook = await createGranolaWebhookEndpointOrThrow({
    client,
    url,
    folderIds,
    preferredScopes: undefined,
    isPersonalConnection: true,
  });

  try {
    const current = await loadGranolaPersonalSync({
      connectionId,
      userWorkspaceId,
      apiKeyFingerprint,
    });

    if (!isDefined(current)) {
      await deleteStaleGranolaWebhookEndpointOrThrow({
        client,
        webhookEndpointId: webhook.id,
      });

      return { skipped: true };
    }

    await kv.set<GranolaPersonalWebhookRegistration>(key, {
      userWorkspaceId,
      webhookEndpointId: webhook.id,
      signingSecret: webhook.signing_secret,
      apiKeyFingerprint,
    });
    await kv.set(claimKey, null, { scope: 'SERVER' });

    return { skipped: false };
  } catch (error) {
    await deleteStaleGranolaWebhookEndpointOrThrow({
      client,
      webhookEndpointId: webhook.id,
    });
    throw error;
  }
};
