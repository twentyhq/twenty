import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderPolicyIcon } from 'src/front-components/components/GranolaFolderPolicyIcon';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { SettingsRadioCard } from 'src/front-components/components/SettingsRadioCard';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaFolderPolicy } from 'src/front-components/types/granola-folder-policy.type';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { fetchGranolaFoldersOrThrow } from 'src/front-components/utils/fetch-granola-folders-or-throw.util';

type FolderSaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'pending' }
  | { kind: 'error'; message: string };

export const GranolaFolderSection = () => {
  const [folders, setFolders] = useState<GranolaSettingsFolder[] | undefined>(
    undefined,
  );
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [policy, setPolicy] = useState<GranolaFolderPolicy>('ALL_FOLDERS');
  const [hasInaccessibleSelection, setHasInaccessibleSelection] =
    useState(false);
  const [saveState, setSaveState] = useState<FolderSaveState>({ kind: 'idle' });

  const { save } = useAutosaveGranolaFolderSelection({
    onSaveStart: () => setSaveState({ kind: 'saving' }),
    onSaveSuccess: (folderIds) => {
      setSaveState({ kind: 'saved' });
      setSelectedFolderIds(folderIds);
    },
    onSaveError: (message) => setSaveState({ kind: 'error', message }),
  });

  const loadFolders = async () => {
    try {
      const result = await fetchGranolaFoldersOrThrow();
      const accessibleIds = new Set(result.folders.map((folder) => folder.id));
      const storedFolderIds =
        result.pendingFolderIds ?? result.selectedFolderIds;
      const accessibleSelectedIds = storedFolderIds.filter((id) =>
        accessibleIds.has(id),
      );

      setFolders(result.folders);
      setSelectedFolderIds(accessibleSelectedIds);
      setPolicy(
        storedFolderIds.length > 0 ? 'SELECTED_FOLDERS' : 'ALL_FOLDERS',
      );
      setHasInaccessibleSelection(
        storedFolderIds.length > 0 && accessibleSelectedIds.length === 0,
      );

      if (isDefined(result.pendingFolderIds)) {
        setSaveState({ kind: 'pending' });
      }
    } catch {
      setLoadError(t('Could not load your Granola folders. Reload to retry.'));
    }
  };

  const handlePolicyChange = (nextPolicy: GranolaFolderPolicy) => {
    setPolicy(nextPolicy);

    if (
      nextPolicy === 'ALL_FOLDERS' &&
      (selectedFolderIds.length > 0 || hasInaccessibleSelection)
    ) {
      setHasInaccessibleSelection(false);
      setSelectedFolderIds([]);
      save([]);
    }
  };

  const handleReplaceSelection = (nextSelectedFolderIds: string[]) => {
    setHasInaccessibleSelection(false);
    setSelectedFolderIds(nextSelectedFolderIds);
    save(nextSelectedFolderIds);
  };

  const handleToggleFolder = (folderId: string, checked: boolean) => {
    handleReplaceSelection(
      checked
        ? [...selectedFolderIds, folderId]
        : selectedFolderIds.filter((id) => id !== folderId),
    );
  };

  const isSelectionFull =
    selectedFolderIds.length >= GRANOLA_FOLDER_SELECTION_LIMIT;
  const hasFolders = isDefined(folders) && folders.length > 0;

  return (
    <Section>
      <OnMountEffect onMount={loadFolders} />
      <H2Title
        title={t('Folders')}
        description={t(
          'Choose which Granola folders feed live sync and history imports.',
        )}
      />
      <StyledSettingsSectionStack>
        <SettingsRadioCard
          value={policy}
          disabled={!isDefined(folders)}
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
              expandedContent: hasFolders ? (
                <GranolaFolderTree
                  folders={folders}
                  selectedFolderIds={selectedFolderIds}
                  selectionLimit={GRANOLA_FOLDER_SELECTION_LIMIT}
                  onToggleFolder={handleToggleFolder}
                  onReplaceSelection={handleReplaceSelection}
                />
              ) : (
                <GranolaFolderEmptyState />
              ),
            },
          ]}
        />
        {!isDefined(folders) && !isDefined(loadError) && (
          <StyledSettingsHint>{t('Loading folders…')}</StyledSettingsHint>
        )}
        {isDefined(loadError) && (
          <StyledSettingsError>{loadError}</StyledSettingsError>
        )}
        {hasInaccessibleSelection && (
          <StyledSettingsError>
            {t(
              'The folders you picked are no longer available. Pick folders again, or switch to Everything.',
            )}
          </StyledSettingsError>
        )}
        {policy === 'SELECTED_FOLDERS' &&
          !hasInaccessibleSelection &&
          hasFolders &&
          selectedFolderIds.length === 0 && (
            <StyledSettingsHint>
              {t('Nothing is picked yet, so every folder still syncs.')}
            </StyledSettingsHint>
          )}
        {policy === 'SELECTED_FOLDERS' && selectedFolderIds.length === 1 && (
          <StyledSettingsHint>
            {t('Switch to Everything to stop filtering by folder.')}
          </StyledSettingsHint>
        )}
        {isSelectionFull && (
          <StyledSettingsHint>
            {t('You can pick up to {limit} folders.', {
              limit: GRANOLA_FOLDER_SELECTION_LIMIT,
            })}
          </StyledSettingsHint>
        )}
        {saveState.kind === 'saving' && (
          <StyledSettingsHint>{t('Saving…')}</StyledSettingsHint>
        )}
        {saveState.kind === 'saved' && (
          <StyledSettingsHint>
            {t('Saved. Live sync and imports now follow this selection.')}
          </StyledSettingsHint>
        )}
        {saveState.kind === 'pending' && (
          <StyledSettingsHint>
            {t(
              'This selection is not applied in Granola yet. It is retried at the next daily catch-up, or change it again to retry now.',
            )}
          </StyledSettingsHint>
        )}
        {saveState.kind === 'error' && (
          <StyledSettingsError>{saveState.message}</StyledSettingsError>
        )}
      </StyledSettingsSectionStack>
    </Section>
  );
};
