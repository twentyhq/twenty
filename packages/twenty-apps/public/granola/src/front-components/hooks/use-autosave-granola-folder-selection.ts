import { useState } from 'react';

import { createSaveQueue } from 'src/front-components/utils/create-save-queue.util';
import { saveGranolaFolderSelectionOrThrow } from 'src/front-components/utils/save-granola-folder-selection-or-throw.util';

type UseAutosaveGranolaFolderSelectionParams = {
  onSaveSuccess: (folderIds: string[]) => void;
  onSaveError: () => void;
};

export const useAutosaveGranolaFolderSelection = ({
  onSaveSuccess,
  onSaveError,
}: UseAutosaveGranolaFolderSelectionParams) => {
  const [saveQueue] = useState(() =>
    createSaveQueue<string[]>({
      saveValue: async (folderIds, isSupersededValue) => {
        try {
          const savedFolderIds =
            await saveGranolaFolderSelectionOrThrow(folderIds);

          if (!isSupersededValue()) {
            onSaveSuccess(savedFolderIds);
          }
        } catch {
          if (!isSupersededValue()) {
            onSaveError();
          }
        }
      },
    }),
  );

  return { save: saveQueue.enqueueSave };
};
