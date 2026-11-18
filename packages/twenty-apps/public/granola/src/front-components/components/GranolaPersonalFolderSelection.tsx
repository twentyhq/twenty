import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { fetchGranolaPersonalFoldersOrThrow } from 'src/front-components/utils/fetch-granola-personal-folders-or-throw.util';
import { saveGranolaPersonalFolderSelectionOrThrow } from 'src/front-components/utils/save-granola-personal-folder-selection-or-throw.util';

type PersonalFolderState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; folders: GranolaSettingsFolder[] };

type GranolaPersonalFolderSelectionProps = { connectionId: string };

export const GranolaPersonalFolderSelection = ({
  connectionId,
}: GranolaPersonalFolderSelectionProps) => {
  const [state, setState] = useState<PersonalFolderState>({
    status: 'loading',
  });
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  const loadFolders = async () => {
    setState({ status: 'loading' });

    try {
      const { folders, folderIds } =
        await fetchGranolaPersonalFoldersOrThrow(connectionId);
      setSelectedFolderIds(folderIds);
      setState({ status: 'loaded', folders });
    } catch {
      setState({ status: 'failed' });
    }
  };

  const { save } = useAutosaveGranolaFolderSelection({
    saveFolderSelection: (folderIds) =>
      saveGranolaPersonalFolderSelectionOrThrow({ connectionId, folderIds }),
    onSaveSuccess: setSelectedFolderIds,
    onSaveError: () => {
      enqueueSnackbar({
        message: t('Could not save the folder selection. Try again.'),
        variant: 'error',
      });
      loadFolders();
    },
  });

  const replaceSelection = (folderIds: string[]) => {
    setSelectedFolderIds(folderIds);
    save(folderIds);
  };

  const renderFolders = () => {
    if (state.status === 'loading') {
      return null;
    }

    if (state.status === 'failed') {
      return (
        <InlineBanner
          layout="compact"
          status="error"
          action={
            <InlineBanner.Action onClick={loadFolders}>
              {t('Retry')}
            </InlineBanner.Action>
          }
        >
          {t(
            'Could not load your Granola folders. Check your API key in General.',
          )}
        </InlineBanner>
      );
    }

    if (state.folders.length === 0) {
      return <GranolaFolderEmptyState />;
    }

    return (
      <>
        <InlineBanner layout="compact" status="info">
          {t(
            'People who can read Call Recordings in this workspace can see the shared summaries and transcripts.',
          )}
        </InlineBanner>
        <GranolaFolderTree
          folders={state.folders}
          selectedFolderIds={selectedFolderIds}
          selectionLimit={GRANOLA_FOLDER_SELECTION_LIMIT}
          hint={undefined}
          onToggleFolder={(folderId, checked) =>
            replaceSelection(
              checked
                ? [...selectedFolderIds, folderId]
                : selectedFolderIds.filter((id) => id !== folderId),
            )
          }
          onReplaceSelection={replaceSelection}
        />
        <Text size="sm" color="secondary">
          {t(
            'Future notes from your selected folders and their subfolders will sync. Clear the selection to turn off personal sync.',
          )}
        </Text>
      </>
    );
  };

  return (
    <>
      <OnMountEffect onMount={loadFolders} />
      {renderFolders()}
    </>
  );
};
