import { useRef, useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { useDebouncedCallback } from 'use-debounce';

import { GRANOLA_FOLDER_SELECTION_SAVE_DEBOUNCE_MILLISECONDS } from 'src/front-components/constants/granola-folder-selection-save-debounce.constant';
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
  const latestRequestedFolderIdsRef = useRef<string[] | undefined>(undefined);
  const [saveQueue] = useState(() =>
    createSaveQueue<string[]>({
      saveValue: async (folderIds, isSupersededValue) => {
        // A selection still waiting on the debounce timer is not queued yet.
        const isStaleValue = () =>
          isSupersededValue() ||
          latestRequestedFolderIdsRef.current !== folderIds;

        onSaveStart();

        try {
          const savedFolderIds =
            await saveGranolaFolderSelectionOrThrow(folderIds);

          if (!isStaleValue()) {
            onSaveSuccess(savedFolderIds);
          }
        } catch (error) {
          if (!isStaleValue()) {
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

  const enqueueSaveDebounced = useDebouncedCallback(
    saveQueue.enqueueSave,
    GRANOLA_FOLDER_SELECTION_SAVE_DEBOUNCE_MILLISECONDS,
  );

  const saveDebounced = (folderIds: string[]) => {
    latestRequestedFolderIdsRef.current = folderIds;
    enqueueSaveDebounced(folderIds);
  };

  const saveImmediately = (folderIds: string[]) => {
    latestRequestedFolderIdsRef.current = folderIds;
    enqueueSaveDebounced.cancel();
    saveQueue.enqueueSave(folderIds);
  };

  return { saveDebounced, saveImmediately };
};
