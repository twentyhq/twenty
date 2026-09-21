import { kv, RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PENDING_FOLDER_SELECTION_KEY } from 'src/constants/granola.constant';
import { type GranolaPendingFolderSelection } from 'src/logic-functions/types/granola-pending-folder-selection.type';

export const assertGranolaFolderSelectionReadyOrThrow =
  async (): Promise<void> => {
    const pending = await kv.get<GranolaPendingFolderSelection>(
      GRANOLA_PENDING_FOLDER_SELECTION_KEY,
    );

    if (isDefined(pending)) {
      throw new RetryableLogicFunctionError(
        'Granola folder selection is still being saved. Retry saving the selected folders.',
      );
    }
  };
