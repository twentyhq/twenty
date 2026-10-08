import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PENDING_FOLDER_SELECTION_KEY } from 'src/constants/granola.constant';
import { type GranolaPendingFolderSelection } from 'src/logic-functions/types/granola-pending-folder-selection.type';

export const isGranolaFolderSelectionPending = async (): Promise<boolean> =>
  isDefined(
    await kv.get<GranolaPendingFolderSelection>(
      GRANOLA_PENDING_FOLDER_SELECTION_KEY,
    ),
  );
