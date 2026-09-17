import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { Info } from 'twenty-ui/feedback';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderPolicyIcon } from 'src/front-components/components/GranolaFolderPolicyIcon';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';
import { type GranolaFoldersResult } from 'src/front-components/types/granola-folders-result.type';
import { computeGranolaFolderSelection } from 'src/front-components/utils/compute-granola-folder-selection.util';

const getSelectionHint = (selectedFolderCount: number) => {
  if (selectedFolderCount === 0) {
    return t('Nothing is picked yet, so every folder still syncs.');
  }

  if (selectedFolderCount === 1) {
    return t('Switch to Everything to stop filtering by folder.');
  }

  if (selectedFolderCount >= GRANOLA_FOLDER_SELECTION_LIMIT) {
    return t('You can pick up to {limit} folders.', {
      limit: GRANOLA_FOLDER_SELECTION_LIMIT,
    });
  }

  return undefined;
};

type GranolaFolderPickerProps = {
  foldersResult: GranolaFoldersResult;
  onSaveError: () => void;
};

export const GranolaFolderPicker = ({
  foldersResult,
  onSaveError,
}: GranolaFolderPickerProps) => {
  const [selection, setSelection] = useState(() =>
    computeGranolaFolderSelection(foldersResult),
  );

  const { save } = useAutosaveGranolaFolderSelection({
    onSaveSuccess: (folderIds) =>
      setSelection((current) => ({
        ...current,
        selectedFolderIds: folderIds,
        isSelectionPending: false,
      })),
    onSaveError: () => {
      enqueueSnackbar({
        message: t('Could not save the folder selection. Try again.'),
        variant: 'error',
      });
      onSaveError();
    },
  });

  const handleReplaceSelection = (nextSelectedFolderIds: string[]) => {
    setSelection((current) => ({
      ...current,
      selectedFolderIds: nextSelectedFolderIds,
      hasInaccessibleSelection: false,
    }));
    save(nextSelectedFolderIds);
  };

  const handlePolicyChange = (nextPolicy: GranolaFolderPolicy) => {
    setSelection((current) => ({ ...current, policy: nextPolicy }));

    if (
      nextPolicy === 'ALL_FOLDERS' &&
      (selection.selectedFolderIds.length > 0 ||
        selection.hasInaccessibleSelection)
    ) {
      handleReplaceSelection([]);
    }
  };

  const handleToggleFolder = (folderId: string, checked: boolean) => {
    handleReplaceSelection(
      checked
        ? [...selection.selectedFolderIds, folderId]
        : selection.selectedFolderIds.filter((id) => id !== folderId),
    );
  };

  return (
    <>
      <SettingsRadioCard
        value={selection.policy}
        onChange={handlePolicyChange}
        options={[
          {
            value: 'ALL_FOLDERS',
            cardMedia: <GranolaFolderPolicyIcon policy="ALL_FOLDERS" />,
            title: t('Everything'),
            description: t('Sync notes from every folder you can access'),
          },
          {
            value: 'SELECTED_FOLDERS',
            cardMedia: <GranolaFolderPolicyIcon policy="SELECTED_FOLDERS" />,
            title: t('Some folders'),
            description: t(
              'Sync only the folders you pick, including their subfolders',
            ),
            expandedContent:
              foldersResult.folders.length > 0 ? (
                <GranolaFolderTree
                  folders={foldersResult.folders}
                  selectedFolderIds={selection.selectedFolderIds}
                  selectionLimit={GRANOLA_FOLDER_SELECTION_LIMIT}
                  hint={
                    selection.hasInaccessibleSelection
                      ? undefined
                      : getSelectionHint(selection.selectedFolderIds.length)
                  }
                  onToggleFolder={handleToggleFolder}
                  onReplaceSelection={handleReplaceSelection}
                />
              ) : (
                <GranolaFolderEmptyState />
              ),
          },
        ]}
      />
      {selection.hasInaccessibleSelection && (
        <Info
          accent="danger"
          text={t(
            'The folders you picked are no longer available. Pick folders again, or switch to Everything.',
          )}
        />
      )}
      {selection.isSelectionPending && !selection.hasInaccessibleSelection && (
        <Info
          accent="blue"
          text={t(
            'This selection is not applied in Granola yet. It is retried at the next daily catch-up.',
          )}
          buttonTitle={t('Retry now')}
          onClick={() => save(selection.selectedFolderIds)}
        />
      )}
    </>
  );
};
