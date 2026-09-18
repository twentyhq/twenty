import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Info } from 'twenty-ui/feedback';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderPolicyRadioCard } from 'src/front-components/components/GranolaFolderPolicyRadioCard';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { GranolaFolderTreeSkeleton } from 'src/front-components/components/GranolaFolderTreeSkeleton';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';
import { type GranolaFoldersResult } from 'src/front-components/types/granola-folders-result.type';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { computeGranolaFolderSelection } from 'src/front-components/utils/compute-granola-folder-selection.util';
import { dropInaccessibleGranolaFolders } from 'src/front-components/utils/drop-inaccessible-granola-folders.util';
import { fetchGranolaFoldersOrThrow } from 'src/front-components/utils/fetch-granola-folders-or-throw.util';

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

type GranolaFolderListState =
  | { step: 'NOT_LOADED' }
  | { step: 'LOADING' }
  | { step: 'FAILED' }
  | { step: 'LOADED'; folders: GranolaSettingsFolder[] };

type GranolaFolderPickerProps = Pick<
  GranolaFoldersResult,
  'selectedFolderIds' | 'pendingFolderIds'
>;

export const GranolaFolderPicker = ({
  selectedFolderIds,
  pendingFolderIds,
}: GranolaFolderPickerProps) => {
  const [selection, setSelection] = useState(() =>
    computeGranolaFolderSelection({ selectedFolderIds, pendingFolderIds }),
  );
  const [folderList, setFolderList] = useState<GranolaFolderListState>({
    step: 'NOT_LOADED',
  });
  const [isLocked, setIsLocked] = useState(false);

  const loadFolderList = async ({
    isSelectionStale,
  }: {
    isSelectionStale: boolean;
  }) => {
    if (isSelectionStale) {
      setIsLocked(true);
    }
    setFolderList({ step: 'LOADING' });

    const foldersResult = await fetchGranolaFoldersOrThrow().catch(
      () => undefined,
    );

    if (!isDefined(foldersResult)) {
      setFolderList({ step: 'FAILED' });

      return;
    }

    setSelection((current) =>
      dropInaccessibleGranolaFolders({
        selection: isSelectionStale
          ? computeGranolaFolderSelection(foldersResult)
          : current,
        folders: foldersResult.folders,
      }),
    );
    setFolderList({ step: 'LOADED', folders: foldersResult.folders });

    if (isSelectionStale) {
      setIsLocked(false);
    }
  };

  const loadFolderListIfSelected = () => {
    if (selection.policy === 'SELECTED_FOLDERS') {
      loadFolderList({ isSelectionStale: false });
    }
  };

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
      loadFolderList({ isSelectionStale: true });
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
      nextPolicy === 'SELECTED_FOLDERS' &&
      (folderList.step === 'NOT_LOADED' || folderList.step === 'FAILED')
    ) {
      loadFolderList({ isSelectionStale: false });
    }

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

  const getSelectedFoldersContent = () => {
    if (folderList.step === 'FAILED') {
      return undefined;
    }

    if (folderList.step !== 'LOADED') {
      return <GranolaFolderTreeSkeleton />;
    }

    if (folderList.folders.length === 0) {
      return <GranolaFolderEmptyState />;
    }

    return (
      <GranolaFolderTree
        folders={folderList.folders}
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
    );
  };

  const showsFolderListError =
    folderList.step === 'FAILED' &&
    (isLocked || selection.policy === 'SELECTED_FOLDERS');

  return (
    <>
      <OnMountEffect onMount={loadFolderListIfSelected} />
      <GranolaFolderPolicyRadioCard
        policy={isLocked ? undefined : selection.policy}
        selectedFoldersContent={getSelectedFoldersContent()}
        onChange={handlePolicyChange}
      />
      {showsFolderListError && (
        <Info
          accent="danger"
          text={t('Could not load your Granola folders.')}
          buttonTitle={t('Retry')}
          onClick={() => loadFolderList({ isSelectionStale: isLocked })}
        />
      )}
      {!isLocked && selection.hasInaccessibleSelection && (
        <Info
          accent="danger"
          text={t(
            'The folders you picked are no longer available. Pick folders again, or switch to Everything.',
          )}
        />
      )}
      {!isLocked &&
        selection.isSelectionPending &&
        !selection.hasInaccessibleSelection && (
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
