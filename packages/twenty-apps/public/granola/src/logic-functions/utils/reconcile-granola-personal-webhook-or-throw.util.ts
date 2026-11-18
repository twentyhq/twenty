import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { createGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/create-granola-webhook-endpoint-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import {
  GRANOLA_PERSONAL_REGISTRATION_PREFIX,
  getGranolaPersonalWebhookKey,
} from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { repairGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/repair-granola-webhook-endpoint-or-throw.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';

export const reconcileGranolaPersonalWebhookOrThrow = async ({
  scope,
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
      connectionId: scope.connectionId,
      client,
    });

    return;
  }

  const apiUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiUrl)) {
    throw new Error(
      'TWENTY_API_URL is required to register a Granola webhook.',
    );
  }

  const key = getGranolaPersonalWebhookKey(scope.connectionId);
  const registrationId =
    GRANOLA_PERSONAL_REGISTRATION_PREFIX + scope.connectionId;
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

    return;
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
      ...scope,
      apiKeyFingerprint,
    });

    if (isDefined(current)) {
      await kv.set<GranolaPersonalWebhookRegistration>(key, {
        userWorkspaceId: scope.userWorkspaceId,
        webhookEndpointId: webhook.id,
        signingSecret: webhook.signing_secret,
        apiKeyFingerprint,
      });
      await kv.set(claimKey, null, { scope: 'SERVER' });

      return;
    }
  } catch (error) {
    await deleteStaleGranolaWebhookEndpointOrThrow({
      client,
      webhookEndpointId: webhook.id,
    });
    throw error;
  }

  await deleteStaleGranolaWebhookEndpointOrThrow({
    client,
    webhookEndpointId: webhook.id,
  });
};
