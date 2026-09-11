import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';

import { createSaveQueue } from 'src/front-components/utils/create-save-queue.util';
import { saveGranolaFolderSelectionOrThrow } from 'src/front-components/utils/save-granola-folder-selection-or-throw.util';

type UseAutosaveGranolaFolderSelectionParams = {
  onSaveStart: () => void;
  onSaveSuccess: (folderIds: string[]) => void;
  onSaveError: (message: string) => void;
};

export const useAutosaveGranolaFolderSelection = ({
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveGranolaFolderSelectionParams) => {
  const [saveQueue] = useState(() =>
    createSaveQueue<string[]>({
      saveValue: async (folderIds, isSupersededValue) => {
        onSaveStart();

        try {
          const savedFolderIds =
            await saveGranolaFolderSelectionOrThrow(folderIds);

          if (!isSupersededValue()) {
            onSaveSuccess(savedFolderIds);
          }
        } catch (error) {
          if (!isSupersededValue()) {
            onSaveError(
              error instanceof Error
                ? error.message
                : t('Could not save the folder selection. Try again.'),
            );
          }
        }
      },
    }),
  );

  return { save: saveQueue.enqueueSave };
};
