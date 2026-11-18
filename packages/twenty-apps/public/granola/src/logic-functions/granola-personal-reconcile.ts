import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { reconcileGranolaPersonalWebhookOrThrow } from 'src/logic-functions/utils/reconcile-granola-personal-webhook-or-throw.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';

export const granolaPersonalReconcileHandler = async ({
  connectedAccountId: connectionId,
  userWorkspaceId,
}: {
  connectedAccountId: string;
  userWorkspaceId?: string;
}) => {
  const selection = await kv.get<GranolaPersonalFolderSelection[]>(
    getGranolaPersonalFolderSelectionKey(connectionId),
  );

  if (!isDefined(selection)) {
    return { success: true, skipped: true };
  }

  const connection = isDefined(userWorkspaceId)
    ? (await listGranolaPersonalConnections(userWorkspaceId)).find(
        ({ id }) => id === connectionId,
      )
    : await getConnection(connectionId).catch((error: unknown) => {
        if (!(error instanceof AppConnectionAuthFailedError)) {
          throw error;
        }

        return undefined;
      });

  if (
    !isDefined(connection) ||
    connection.providerName !== GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME ||
    connection.scope !== 'USER' ||
    !isDefined(connection.workspaceMemberId) ||
    isDefined(connection.authFailedAt) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return { success: true, skipped: true };
  }

  const client = createGranolaClientOrThrow({ apiKey: connection.accessToken });

  if (selection.length === 0) {
    await removeGranolaPersonalWebhook({ connectionId, client });

    return { success: true, skipped: true };
  }

  const scope = { connectionId, userWorkspaceId: connection.userWorkspaceId };
  const apiKeyFingerprint = getGranolaApiKeyFingerprint(connection.accessToken);

  try {
    const folders = await listAllGranolaFoldersOrThrow({ client });
    const current = await loadGranolaPersonalSync({
      ...scope,
      apiKeyFingerprint,
    });

    if (!isDefined(current)) {
      return { success: true, skipped: true };
    }

    const availableFolderIds = new Set(folders.map(({ id }) => id));
    const availableSelection = current.selection.filter(({ folderId }) =>
      availableFolderIds.has(folderId),
    );
    const selectedFolderIds = availableSelection.map(
      ({ folderId }) => folderId,
    );
    await reconcileGranolaPersonalWebhookOrThrow({
      scope,
      client,
      apiKeyFingerprint,
      folderIds: selectedFolderIds,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof GranolaApiError && error.status === 401) {
      const current = await loadGranolaPersonalSync({
        ...scope,
        apiKeyFingerprint,
      });

      if (isDefined(current)) {
        await reportConnectionAuthFailure({ connectionId });
      }

      return { success: true, skipped: true };
    }

    rethrowKnownOrWrapGranolaError({
      operation: 'Personal sync reconciliation',
      error,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-reconcile',
  description:
    'Reconciles folder-scoped webhook delivery for a personal Granola connection.',
  timeoutSeconds: 120,
  handler: granolaPersonalReconcileHandler,
});
