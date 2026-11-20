import { isNonEmptyArray } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_RECONCILE_TIMEOUT_SECONDS } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { type GranolaPersonalFolderSelection } from 'src/logic-functions/types/granola-personal-folder-selection.type';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { findGranolaPersonalConnection } from 'src/logic-functions/utils/find-granola-personal-connection.util';
import { loadGranolaPersonalSync } from 'src/logic-functions/utils/load-granola-personal-sync.util';
import { reconcileGranolaPersonalWebhookOrThrow } from 'src/logic-functions/utils/reconcile-granola-personal-webhook-or-throw.util';
import { removeAbandonedGranolaPersonalWebhooksOrThrow } from 'src/logic-functions/utils/remove-abandoned-granola-personal-webhooks-or-throw.util';
import { removeGranolaPersonalWebhook } from 'src/logic-functions/utils/remove-granola-personal-webhook.util';
import { rethrowKnownOrWrapGranolaError } from 'src/logic-functions/utils/rethrow-known-or-wrap-granola-error.util';

const readConnectionOwnerOrThrow = async (connectionId: string) => {
  try {
    const connection = await getConnection(connectionId);

    return connection.userWorkspaceId;
  } catch (error) {
    if (error instanceof AppConnectionAuthFailedError) {
      return undefined;
    }

    throw error;
  }
};

export const granolaPersonalReconcileHandler = async ({
  connectedAccountId: connectionId,
  userWorkspaceId,
  scheduledApiKeyFingerprint,
}: {
  connectedAccountId: string;
  userWorkspaceId?: string;
  scheduledApiKeyFingerprint?: string;
}) => {
  const selection = await kv.get<GranolaPersonalFolderSelection[]>(
    getGranolaPersonalFolderSelectionKey(connectionId),
  );

  if (!isDefined(selection)) {
    return { success: true, skipped: true };
  }

  const ownerId =
    userWorkspaceId ?? (await readConnectionOwnerOrThrow(connectionId));

  if (!isDefined(ownerId)) {
    return { success: true, skipped: true };
  }

  const connection = await findGranolaPersonalConnection({
    connectionId,
    userWorkspaceId: ownerId,
  });

  if (!isDefined(connection)) {
    return { success: true, skipped: true };
  }

  const client = createGranolaClientOrThrow({ apiKey: connection.accessToken });
  const scope = { connectionId, userWorkspaceId: connection.userWorkspaceId };
  const apiKeyFingerprint = getGranolaApiKeyFingerprint(connection.accessToken);

  if (
    isDefined(scheduledApiKeyFingerprint) &&
    scheduledApiKeyFingerprint !== apiKeyFingerprint
  ) {
    return { success: true, skipped: true };
  }

  const loadCurrentSync = () =>
    loadGranolaPersonalSync({ ...scope, apiKeyFingerprint });
  const cleanUpAbandonedWebhooksOrThrow = async () => {
    if (isDefined(scheduledApiKeyFingerprint)) {
      await removeAbandonedGranolaPersonalWebhooksOrThrow({
        connectionId,
        client,
      });
    }
  };

  try {
    if (!isNonEmptyArray(selection)) {
      const currentSelection = await kv.get<GranolaPersonalFolderSelection[]>(
        getGranolaPersonalFolderSelectionKey(connectionId),
      );

      if (!isDefined(currentSelection) || isNonEmptyArray(currentSelection)) {
        return { success: true, skipped: true };
      }

      await removeGranolaPersonalWebhook({ connectionId, client });
      await cleanUpAbandonedWebhooksOrThrow();

      return { success: true, skipped: true };
    }

    const folders = await listAllGranolaFoldersOrThrow({ client });
    const current = await loadCurrentSync();

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
    const result = await reconcileGranolaPersonalWebhookOrThrow({
      scope,
      client,
      apiKeyFingerprint,
      folderIds: selectedFolderIds,
      selection: current.selection,
    });

    await cleanUpAbandonedWebhooksOrThrow();

    return { success: true, ...result };
  } catch (error) {
    if (!(error instanceof GranolaApiError) || error.status !== 401) {
      rethrowKnownOrWrapGranolaError({
        operation: 'Personal sync reconciliation',
        error,
      });
    }

    if (isDefined(await loadCurrentSync())) {
      await reportConnectionAuthFailure({ connectionId });
    }

    return { success: true, skipped: true };
  }
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-reconcile',
  description:
    'Reconciles folder-scoped webhook delivery for a personal Granola connection.',
  timeoutSeconds: GRANOLA_PERSONAL_RECONCILE_TIMEOUT_SECONDS,
  handler: granolaPersonalReconcileHandler,
});
