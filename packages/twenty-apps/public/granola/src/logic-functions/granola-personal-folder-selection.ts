import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import {
  kv,
  Response,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import {
  GRANOLA_FOLDER_ID_PATTERN,
  GRANOLA_FOLDER_SELECTION_LIMIT,
} from 'src/constants/granola-api.constant';
import { GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueGranolaPersonalReconcileOrThrow } from 'src/logic-functions/utils/enqueue-granola-personal-reconcile-or-throw.util';
import { getGranolaSelectedParentFolders } from 'src/logic-functions/utils/get-granola-selected-parent-folders.util';
import { loadGranolaPersonalFolderSettings } from 'src/logic-functions/utils/load-granola-personal-folder-settings.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const FOLDER_SELECTION_SCHEMA = z.object({
  connectionId: z.uuid(),
  folderIds: z
    .array(z.string().regex(GRANOLA_FOLDER_ID_PATTERN))
    .max(GRANOLA_FOLDER_SELECTION_LIMIT),
});

export const granolaPersonalFolderSelectionHandler = async (
  payload: Pick<RoutePayload<unknown>, 'body'>,
  { userWorkspaceId }: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  if (!isDefined(userWorkspaceId)) {
    return new Response({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
  }

  const request = FOLDER_SELECTION_SCHEMA.safeParse(payload.body);

  if (!request.success) {
    return new Response({ error: 'INVALID_FOLDER_SELECTION' }, { status: 400 });
  }

  const settings = await loadGranolaPersonalFolderSettings({
    connectionId: request.data.connectionId,
    userWorkspaceId,
  });

  if (!isDefined(settings)) {
    return new Response({ error: 'CONNECTION_UNAVAILABLE' }, { status: 404 });
  }

  const { folders, selection, selectionKey } = settings;
  const availableFolders = new Set(folders.map(({ id }) => id));

  if (
    request.data.folderIds.some((folderId) => !availableFolders.has(folderId))
  ) {
    return new Response({ error: 'FOLDER_UNAVAILABLE' }, { status: 400 });
  }

  const folderIds = getGranolaSelectedParentFolders({
    folderIds: request.data.folderIds,
    folders,
  });
  const selectedAtByFolderId = new Map(
    selection.map(({ folderId, selectedAt }) => [folderId, selectedAt]),
  );
  const selectedAt = new Date().toISOString();

  await kv.set(
    selectionKey,
    folderIds.map((folderId) => ({
      folderId,
      selectedAt: selectedAtByFolderId.get(folderId) ?? selectedAt,
    })),
  );

  try {
    await enqueueGranolaPersonalReconcileOrThrow({
      connectionId: request.data.connectionId,
      userWorkspaceId,
    });
  } catch (error) {
    console.error(
      `[granola] Could not start personal sync reconciliation. ${toErrorMessage(error)}`,
    );

    return new Response(
      { error: 'SYNC_RECONCILIATION_UNAVAILABLE' },
      { status: 503 },
    );
  }

  return { success: true, folderIds };
};

export default defineLogicFunction({
  universalIdentifier:
    GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-folder-selection',
  description:
    'Saves the folders selected for the member’s Granola connection.',
  timeoutSeconds: 60,
  handler: granolaPersonalFolderSelectionHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_PERSONAL_FOLDER_SELECTION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
