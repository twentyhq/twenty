import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_FOLDERS_ROUTE_PATH } from 'src/constants/granola-folders-route-path';
import { GRANOLA_PENDING_FOLDER_SELECTION_KEY } from 'src/constants/granola.constant';
import { GRANOLA_FOLDERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type GranolaPendingFolderSelection } from 'src/logic-functions/types/granola-pending-folder-selection.type';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';

export const granolaFoldersHandler = async () => {
  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application settings permission is required.',
    };
  }

  const registration = await findGranolaRegistrationForCurrentKey();
  const pending = await kv.get<GranolaPendingFolderSelection>(
    GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  );

  return {
    success: true,
    folders: await listAllGranolaFoldersOrThrow(),
    folderIds: registration?.folderIds ?? [],
    pendingFolderIds: pending?.folderIds,
  };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_FOLDERS_UNIVERSAL_IDENTIFIER,
  name: 'granola-folders',
  description: 'Lists accessible Granola folders for the settings picker.',
  timeoutSeconds: 60,
  handler: granolaFoldersHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_FOLDERS_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
