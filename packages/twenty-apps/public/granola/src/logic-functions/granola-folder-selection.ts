import { defineLogicFunction } from 'twenty-sdk/define';

import { GRANOLA_FOLDER_SELECTION_ROUTE_PATH } from 'src/constants/granola-folder-selection-route-path';
import { GRANOLA_FOLDER_SELECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';
import { readGranolaFolderSelection } from 'src/logic-functions/utils/read-granola-folder-selection.util';

export const granolaFolderSelectionHandler = async () => {
  if (!(await currentUserCanManageGranolaOrThrow())) {
    return {
      success: false,
      error: 'Application settings permission is required.',
    };
  }

  return { success: true, ...(await readGranolaFolderSelection()) };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_FOLDER_SELECTION_UNIVERSAL_IDENTIFIER,
  name: 'granola-folder-selection',
  description:
    'Reads the stored Granola folder selection for the settings picker.',
  timeoutSeconds: 30,
  handler: granolaFolderSelectionHandler,
  httpRouteTriggerSettings: {
    path: GRANOLA_FOLDER_SELECTION_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
