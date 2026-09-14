import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { kv, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import {
  GRANOLA_FOLDER_ID_PATTERN,
  GRANOLA_FOLDER_SELECTION_LIMIT,
} from 'src/constants/granola-api.constant';
import { GRANOLA_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-folder-selection-route-path';
import { GRANOLA_PENDING_FOLDER_SELECTION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_UPDATE_WEBHOOK_FOLDERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { getGranolaSelectedParentFolders } from 'src/logic-functions/utils/get-granola-selected-parent-folders.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { reconcileGranolaFolderSelectionOrThrow } from 'src/logic-functions/utils/reconcile-granola-folder-selection-or-throw.util';

const GRANOLA_FOLDER_SELECTION_SCHEMA = z.object({
  folderIds: z
    .array(z.string().regex(GRANOLA_FOLDER_ID_PATTERN))
    .max(GRANOLA_FOLDER_SELECTION_LIMIT),
});

export const granolaUpdateWebhookFoldersHandler = async (
  payload: RoutePayload<unknown>,
) => {
  const parsed = GRANOLA_FOLDER_SELECTION_SCHEMA.safeParse(payload.body);

  if (!parsed.success) {
    return {
      success: false,
      error: `Select up to ${GRANOLA_FOLDER_SELECTION_LIMIT} valid Granola folders.`,
    };
  }

  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application settings permission is required.',
    };
  }

  const registration = await findGranolaRegistrationForCurrentKey();

  if (!isDefined(registration)) {
    return {
      success: false,
      error: 'Set up live sync before choosing folders.',
    };
  }

  const folders =
    parsed.data.folderIds.length > 0
      ? await listAllGranolaFoldersOrThrow()
      : [];
  const accessibleIds = new Set(folders.map((folder) => folder.id));

  if (parsed.data.folderIds.some((folderId) => !accessibleIds.has(folderId))) {
    return {
      success: false,
      error: 'A selected folder is not accessible to this key.',
    };
  }

  const folderIds = getGranolaSelectedParentFolders({
    folderIds: parsed.data.folderIds,
    folders,
  });
  await kv.set(GRANOLA_PENDING_FOLDER_SELECTION_KEY, { folderIds });

  try {
    await reconcileGranolaFolderSelectionOrThrow();
  } catch (error) {
    if (
      error instanceof RetryableLogicFunctionError ||
      error instanceof GranolaApiError
    ) {
      return { success: false, error: error.message };
    }

    throw error;
  }

  return { success: true, folderIds };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_UPDATE_WEBHOOK_FOLDERS_UNIVERSAL_IDENTIFIER,
  name: 'granola-update-webhook-folders',
  description:
    'Sets the folders used by both Granola webhook deliveries and history imports.',
  timeoutSeconds: 60,
  handler: granolaUpdateWebhookFoldersHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_FOLDER_SELECTION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
