import { useState } from 'react';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconFolder } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderRow } from 'src/front-components/components/GranolaFolderRow';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsError } from 'src/front-components/components/StyledSettingsError';
import { StyledSettingsHint } from 'src/front-components/components/StyledSettingsHint';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { useAutosaveGranolaFolderSelection } from 'src/front-components/hooks/use-autosave-granola-folder-selection';
import { type GranolaSettingsFolder } from 'src/front-components/types/granola-settings-folder.type';
import { fetchGranolaFoldersOrThrow } from 'src/front-components/utils/fetch-granola-folders-or-throw.util';
import { getGranolaFolderOptions } from 'src/front-components/utils/get-granola-folder-options.util';

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
  const [isRestricted, setIsRestricted] = useState(false);
  const [saveState, setSaveState] = useState<FolderSaveState>({ kind: 'idle' });

  const { saveDebounced, saveImmediately } = useAutosaveGranolaFolderSelection({
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
      setIsRestricted(accessibleSelectedIds.length > 0);

      if (isDefined(result.pendingFolderIds)) {
        setSaveState({ kind: 'pending' });
      }
    } catch {
      setLoadError(t('Could not load your Granola folders. Reload to retry.'));
    }
  };

  const handleSyncAllChange = (isSyncingAll: boolean) => {
    setIsRestricted(!isSyncingAll);

    if (isSyncingAll && selectedFolderIds.length > 0) {
      setSelectedFolderIds([]);
      saveImmediately([]);
    }
  };

  const handleFolderChange = (folderId: string, checked: boolean) => {
    const nextSelectedFolderIds = checked
      ? [...selectedFolderIds, folderId]
      : selectedFolderIds.filter((id) => id !== folderId);

    setSelectedFolderIds(nextSelectedFolderIds);
    saveDebounced(nextSelectedFolderIds);
  };

  const folderOptions = getGranolaFolderOptions(folders ?? []);
  const selectedFolderIdSet = new Set(selectedFolderIds);
  const isSelectionFull =
    selectedFolderIds.length >= GRANOLA_FOLDER_SELECTION_LIMIT;

  return (
    <Section>
      <OnMountEffect onMount={loadFolders} />
      <H2Title
        title={t('Folders')}
        description={t(
          'Sync every folder you can access, or only the ones you pick. Picking a folder includes its subfolders.',
        )}
      />
      <StyledSettingsSectionStack>
        <StyledSettingsCard>
          <SettingsOptionCardContentToggle
            Icon={IconFolder}
            title={t('Sync all folders')}
            description={t('Turn off to choose specific folders below.')}
            checked={!isRestricted}
            disabled={!isDefined(folders)}
            divider={isRestricted}
            onChange={handleSyncAllChange}
          />
          {isRestricted &&
            folderOptions.map((folder) => {
              const isCoveredByAncestor = folder.ancestorIds.some((id) =>
                selectedFolderIdSet.has(id),
              );
              const isChecked =
                isCoveredByAncestor || selectedFolderIdSet.has(folder.id);

              return (
                <GranolaFolderRow
                  key={folder.id}
                  name={folder.name}
                  path={folder.path}
                  depth={folder.depth}
                  checked={isChecked}
                  disabled={
                    isCoveredByAncestor || (isSelectionFull && !isChecked)
                  }
                  onChange={(checked) => handleFolderChange(folder.id, checked)}
                />
              );
            })}
        </StyledSettingsCard>
        {!isDefined(folders) && !isDefined(loadError) && (
          <StyledSettingsHint>{t('Loading folders…')}</StyledSettingsHint>
        )}
        {isDefined(loadError) && (
          <StyledSettingsError>{loadError}</StyledSettingsError>
        )}
        {isRestricted && folderOptions.length === 0 && isDefined(folders) && (
          <StyledSettingsHint>
            {t('This key has no access to any folder yet.')}
          </StyledSettingsHint>
        )}
        {isRestricted &&
          folderOptions.length > 0 &&
          selectedFolderIds.length === 0 && (
            <StyledSettingsHint>
              {t('Pick at least one folder. Until then, every folder syncs.')}
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
