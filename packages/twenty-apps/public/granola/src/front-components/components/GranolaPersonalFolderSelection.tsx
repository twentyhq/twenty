import { useState } from 'react';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { z } from 'zod';

import { GRANOLA_FOLDER_SELECTION_LIMIT } from 'src/constants/granola-api.constant';
import { GranolaFolderEmptyState } from 'src/front-components/components/GranolaFolderEmptyState';
import { GranolaFolderTree } from 'src/front-components/components/GranolaFolderTree';
import { OnMountEffect } from 'src/front-components/components/OnMountEffect';
import {
  GRANOLA_SETTINGS_FOLDER_SCHEMA,
  type GranolaSettingsFolder,
} from 'src/front-components/types/granola-settings-folder.type';
import { requestGranolaPersonalSettingsOrThrow } from 'src/front-components/utils/request-granola-personal-settings-or-throw.util';

const FOLDER_SELECTION_RESPONSE_SCHEMA = z.object({
  success: z.literal(true),
  folderIds: z.array(z.string()),
});
const FOLDERS_RESPONSE_SCHEMA = FOLDER_SELECTION_RESPONSE_SCHEMA.extend({
  folders: z.array(GRANOLA_SETTINGS_FOLDER_SCHEMA),
});

type PersonalFolderState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; folders: GranolaSettingsFolder[]; folderIds: string[] };

type GranolaPersonalFolderSelectionProps = { connectionId: string };

export const GranolaPersonalFolderSelection = ({
  connectionId,
}: GranolaPersonalFolderSelectionProps) => {
  const [state, setState] = useState<PersonalFolderState>({
    status: 'loading',
  });
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadFolders = async () => {
    setState({ status: 'loading' });

    try {
      const { folders, folderIds } =
        await requestGranolaPersonalSettingsOrThrow({
          request: { action: 'list-folders', connectionId },
          responseSchema: FOLDERS_RESPONSE_SCHEMA,
        });
      setSelectedFolderIds(folderIds);
      setState({ status: 'loaded', folders, folderIds });
    } catch {
      setState({ status: 'failed' });
    }
  };

  const saveFolders = async () => {
    setIsSaving(true);

    try {
      const { folderIds } = await requestGranolaPersonalSettingsOrThrow({
        request: {
          action: 'save-folders',
          connectionId,
          folderIds: selectedFolderIds,
        },
        responseSchema: FOLDER_SELECTION_RESPONSE_SCHEMA,
      });
      setSelectedFolderIds((current) =>
        current === selectedFolderIds ? folderIds : current,
      );
      setState((current) =>
        current.status === 'loaded' ? { ...current, folderIds } : current,
      );
      enqueueSnackbar({
        message: t('Granola folders saved.'),
        variant: 'success',
      });
    } catch {
      enqueueSnackbar({
        message: t('Could not save the folder selection. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFolder = (folderId: string, checked: boolean) => {
    setSelectedFolderIds((current) =>
      checked
        ? [...current, folderId]
        : current.filter((id) => id !== folderId),
    );
  };

  const isSelectionChanged =
    state.status === 'loaded' &&
    (selectedFolderIds.length !== state.folderIds.length ||
      selectedFolderIds.some((id) => !state.folderIds.includes(id)));

  return (
    <>
      <OnMountEffect onMount={loadFolders} />
      {state.status === 'failed' && (
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
      )}
      {state.status === 'loaded' &&
        (state.folders.length === 0 ? (
          <GranolaFolderEmptyState />
        ) : (
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
              onToggleFolder={toggleFolder}
              onReplaceSelection={setSelectedFolderIds}
            />
            <Text size="sm" color="secondary">
              {t(
                'Only future notes from the folders you save will sync. Clear all selected folders to turn off personal sync.',
              )}
            </Text>
            <div>
              <Button
                variant="solid"
                color="accent"
                disabled={!isSelectionChanged || isSaving}
                onClick={saveFolders}
              >
                {t('Save folders')}
              </Button>
            </div>
          </>
        ))}
    </>
  );
};
