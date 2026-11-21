import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconFolder } from 'twenty-ui/icon';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderPolicyRadioCard } from 'src/front-components/components/GranolaFolderPolicyRadioCard';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaMemberFolderPolicy } from 'src/front-components/types/granola-member-folder-policy.type';
import { type GranolaPersonalFolders } from 'src/front-components/types/granola-personal-folders.type';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { fetchGranolaPersonalFoldersOrThrow } from 'src/front-components/utils/fetch-granola-personal-folders-or-throw.util';
import { getGranolaMemberFolderPolicyOptions } from 'src/front-components/utils/get-granola-member-folder-policy-options.util';
import { saveGranolaPersonalFolderSelectionOrThrow } from 'src/front-components/utils/save-granola-personal-folder-selection-or-throw.util';

const getSelectionHint = (selectedFolderCount: number) => {
  if (selectedFolderCount === 0) {
    return t('Nothing is picked yet, so nothing is shared.');
  }

  if (selectedFolderCount === 1) {
    return t('Switch to Off to stop sharing.');
  }

  if (selectedFolderCount >= GRANOLA_FOLDER_SELECTION_LIMIT) {
    return t('You can pick up to {limit} folders.', {
      limit: GRANOLA_FOLDER_SELECTION_LIMIT,
    });
  }

  return undefined;
};

const getPolicyForSelection = (
  folderIds: string[],
): GranolaMemberFolderPolicy =>
  isNonEmptyArray(folderIds) ? 'SELECTED_FOLDERS' : 'NO_FOLDERS';

type PersonalFolderState =
  | { status: 'loading' }
  | { status: 'failed' }
  | {
      status: 'loaded';
      folders: GranolaSettingsFolder[];
      policy: GranolaMemberFolderPolicy;
    };

type GranolaPersonalFolderSelectionProps = {
  connectionId: string;
  initialFolders: GranolaPersonalFolders | undefined;
};

export const GranolaPersonalFolderSelection = ({
  connectionId,
  initialFolders,
}: GranolaPersonalFolderSelectionProps) => {
  const [state, setState] = useState<PersonalFolderState>(
    isDefined(initialFolders)
      ? {
          status: 'loaded',
          folders: initialFolders.folders,
          policy: getPolicyForSelection(initialFolders.folderIds),
        }
      : { status: 'loading' },
  );
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(
    initialFolders?.folderIds ?? [],
  );

  const loadFolders = async () => {
    setState({ status: 'loading' });

    try {
      const { folders, folderIds } =
        await fetchGranolaPersonalFoldersOrThrow(connectionId);
      setSelectedFolderIds(folderIds);
      setState({
        status: 'loaded',
        folders,
        policy: getPolicyForSelection(folderIds),
      });
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

  const handlePolicyChange = (nextPolicy: GranolaMemberFolderPolicy) => {
    setState((current) =>
      current.status === 'loaded'
        ? { ...current, policy: nextPolicy }
        : current,
    );

    if (nextPolicy === 'NO_FOLDERS' && isNonEmptyArray(selectedFolderIds)) {
      replaceSelection([]);
    }
  };

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

  const renderSelectedFolders = () => {
    if (state.status !== 'loaded') {
      return undefined;
    }

    if (state.folders.length === 0) {
      return (
        <GranolaFolderEmptyState
          Icon={IconFolder}
          message={t('No folders found for this key')}
        />
      );
    }

    return (
      <GranolaFolderTree
        folders={state.folders}
        selectedFolderIds={selectedFolderIds}
        selectionLimit={GRANOLA_FOLDER_SELECTION_LIMIT}
        hint={getSelectionHint(selectedFolderIds.length)}
        onToggleFolder={(folderId, checked) =>
          replaceSelection(
            checked
              ? [...selectedFolderIds, folderId]
              : selectedFolderIds.filter((id) => id !== folderId),
          )
        }
        onReplaceSelection={replaceSelection}
      />
    );
  };

  return (
    <>
      {!isDefined(initialFolders) && <OnMountEffect onMount={loadFolders} />}
      <GranolaFolderPolicyRadioCard
        options={getGranolaMemberFolderPolicyOptions()}
        policy={state.status === 'loaded' ? state.policy : undefined}
        expandedContentByPolicy={{ SELECTED_FOLDERS: renderSelectedFolders() }}
        onChange={handlePolicyChange}
      />
    </>
  );
};
