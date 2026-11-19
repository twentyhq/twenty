import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { type GranolaPersonalSyncScope } from 'src/logic-functions/types/granola-personal-sync-scope.type';
import { type GranolaPersonalWebhookRegistration } from 'src/logic-functions/types/granola-personal-webhook-registration.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { createGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/create-granola-webhook-endpoint-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaPersonalRegistrationId } from 'src/logic-functions/utils/get-granola-personal-registration-id.util';
import { getGranolaPersonalWebhookKey } from 'src/logic-functions/utils/get-granola-personal-webhook-key.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { getGranolaWebhookDestinationUrlOrThrow } from 'src/logic-functions/utils/get-granola-webhook-destination-url-or-throw.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { repairGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/repair-granola-webhook-endpoint-or-throw.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';

export const reconcileGranolaPersonalWebhookOrThrow = async ({
  scope,
  client,
  apiKeyFingerprint,
  folderIds,
  selection,
}: {
  scope: GranolaPersonalSyncScope;
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    | 'createWebhookEndpoint'
    | 'deleteWebhookEndpoint'
    | 'listWebhookEndpoints'
    | 'updateWebhookEndpoint'
  >;
  apiKeyFingerprint: string;
  folderIds: string[];
  selection: GranolaPersonalFolderSelection[];
}) => {
  const { connectionId, userWorkspaceId } = scope;
  const isSelectionCurrent = async () => {
    const current = await loadGranolaPersonalSync({
      ...scope,
      apiKeyFingerprint,
    });
    if (!isDefined(current)) {
      return false;
    }

    const savedAtByFolder = new Map(
      current.selection.map(({ folderId, selectedAt }) => [
        folderId,
        selectedAt,
      ]),
    );

    return (
      savedAtByFolder.size === selection.length &&
      selection.every(
        ({ folderId, selectedAt }) =>
          savedAtByFolder.get(folderId) === selectedAt,
      )
    );
  };

  if (!isNonEmptyArray(folderIds)) {
    if (!(await isSelectionCurrent())) {
      return { skipped: true };
    }

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
  const registrationId = getGranolaPersonalRegistrationId(connectionId);
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

  if (!(await isSelectionCurrent())) {
    return { skipped: true };
  }

  if (isDefined(currentEndpoint)) {
    await repairGranolaWebhookEndpointOrThrow({
      client,
      endpoint: currentEndpoint,
      expectedUrl: url,
      folderIds,
    });

    return { skipped: false };
  }

  await kv.set(claimKey, null, { scope: 'SERVER' });

  const webhook = await createGranolaWebhookEndpointOrThrow({
    client,
    url,
    folderIds,
    preferredScopes: undefined,
    isPersonalConnection: true,
  });

  try {
    if (await isSelectionCurrent()) {
      await kv.set<GranolaPersonalWebhookRegistration>(key, {
        userWorkspaceId,
        webhookEndpointId: webhook.id,
        signingSecret: webhook.signing_secret,
        apiKeyFingerprint,
      });

      return { skipped: false };
    }
  } catch (error) {
    try {
      const registered = await kv.get<GranolaPersonalWebhookRegistration>(key);

      // A failed response can follow a successful KV write.
      if (registered?.webhookEndpointId !== webhook.id) {
        await deleteStaleGranolaWebhookEndpointOrThrow({
          client,
          webhookEndpointId: webhook.id,
        });
      }
    } catch (rollbackError) {
      console.error(
        `[granola] Could not roll back personal endpoint ${webhook.id}. ${toErrorMessage(rollbackError)}`,
      );
    }

    throw error;
  }

  await deleteStaleGranolaWebhookEndpointOrThrow({
    client,
    webhookEndpointId: webhook.id,
  });

  return { skipped: true };
};
