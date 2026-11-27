import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GranolaWebhookEndpoint } from 'src/logic-functions/types/granola-api.type';
import { GranolaWebhookConfigurationError } from 'src/logic-functions/types/granola-webhook-configuration-error';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

export const repairGranolaWebhookEndpointOrThrow = async ({
  client,
  endpoint,
  expectedUrl,
  folderIds,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'updateWebhookEndpoint'
  >;
  endpoint: GranolaWebhookEndpoint;
  expectedUrl: string;
  folderIds?: string[];
}): Promise<GranolaWebhookEndpoint> => {
  if (isDefined(folderIds) && !isNonEmptyArray(folderIds)) {
    throw new GranolaWebhookConfigurationError({
      message: 'A Granola folder filter requires at least one selected folder.',
    });
  }

  const isUrlStale = !endpoint.url_redacted && endpoint.url !== expectedUrl;

  const endpointFolderIds = new Set(endpoint.folder_ids);
  const areFoldersStale =
    isDefined(folderIds) &&
    (folderIds.length !== endpointFolderIds.size ||
      folderIds.some((folderId) => !endpointFolderIds.has(folderId)));

  if (endpoint.enabled && !isUrlStale && !areFoldersStale) {
    return endpoint;
  }

  return client.updateWebhookEndpoint({
    webhookEndpointId: endpoint.id,
    enabled: true,
    ...(isUrlStale ? { url: expectedUrl } : {}),
    ...(areFoldersStale ? { folder_ids: folderIds } : {}),
  });
};
