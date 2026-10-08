import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { isGranolaFolderSelectionPending } from 'src/logic-functions/utils/is-granola-folder-selection-pending.util';

export const assertGranolaFolderSelectionReadyOrThrow =
  async (): Promise<void> => {
    if (await isGranolaFolderSelectionPending()) {
      throw new RetryableLogicFunctionError(
        'Granola folder selection is still being saved. Retry saving the selected folders.',
      );
    }
  };
