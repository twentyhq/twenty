import { defineLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_FOLDERS_ROUTE_PATH } from 'src/constants/granola-folders-route-path';
import { GRANOLA_FOLDERS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { listAllGranolaFoldersOrThrow } from 'src/logic-functions/utils/list-all-granola-folders-or-throw.util';
import { readGranolaFolderSelection } from 'src/logic-functions/utils/read-granola-folder-selection.util';

export const granolaFoldersHandler = async () => {
  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application settings permission is required.',
    };
  }

  return {
    success: true,
    folders: await listAllGranolaFoldersOrThrow(),
    ...(await readGranolaFolderSelection()),
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
