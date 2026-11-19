import { useState } from 'react';

import { createSaveQueue } from 'src/front-components/utils/create-save-queue.util';

type UseAutosaveGranolaFolderSelectionParams = {
  saveFolderSelection: (folderIds: string[]) => Promise<string[]>;
  onSaveSuccess: (folderIds: string[]) => void;
  onSaveError: () => void;
};

export const useAutosaveGranolaFolderSelection = ({
  saveFolderSelection,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveGranolaFolderSelectionParams) => {
  const [saveQueue] = useState(() =>
    createSaveQueue<string[]>({
      saveValue: async (folderIds, isSupersededValue) => {
        try {
          const savedFolderIds = await saveFolderSelection(folderIds);

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
