import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_PENDING_FOLDER_SELECTION_KEY } from 'src/constants/granola.constant';
import { type GranolaPendingFolderSelection } from 'src/logic-functions/types/granola-pending-folder-selection.type';
import { findGranolaRegistrationForCurrentKey } from 'src/logic-functions/utils/find-granola-registration-for-current-key.util';

export const readGranolaFolderSelection = async (): Promise<{
  folderIds: string[];
  pendingFolderIds: string[] | undefined;
}> => {
  const registration = await findGranolaRegistrationForCurrentKey();
  const pending = await kv.get<GranolaPendingFolderSelection>(
    GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  );

  return {
    folderIds: registration?.folderIds ?? [],
    pendingFolderIds: pending?.folderIds,
  };
};
