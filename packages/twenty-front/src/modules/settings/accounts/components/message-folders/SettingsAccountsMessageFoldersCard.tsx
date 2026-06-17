import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsMessageFoldersEmptyStateCard } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersEmptyStateCard';
import { SettingsMessageFoldersSkeletonLoader } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersSkeletonLoader';
import { SettingsMessageFoldersTreeItem } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTreeItem';
import { computeFolderIdsForSyncToggle } from '@/settings/accounts/components/message-folders/utils/computeFolderIdsForSyncToggle';
import { computeMessageFolderTree } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { useMyMessageFolders } from '@/settings/accounts/hooks/useMyMessageFolders';
import { useUpdateMessageFoldersSyncStatus } from '@/settings/accounts/hooks/useUpdateMessageFoldersSyncStatus';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo, useState } from 'react';
import { Label } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTreeList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledFoldersContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: space-between;
  padding-left: ${themeCssVariables.spacing[1]};
  text-align: left;
`;

const StyledLabelContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAccountsMessageFoldersCard = () => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');

  const { enqueueErrorSnackBar } = useSnackBar();

  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );

  const { updateMessageFoldersSyncStatus } =
    useUpdateMessageFoldersSyncStatus();

  const { messageFolders, loading } = useMyMessageFolders(
    settingsAccountsSelectedMessageChannel?.id,
  );

  const filteredMessageFolders = useMemo(() => {
    return messageFolders.filter((folder) =>
      folder.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [messageFolders, search]);

  const folderTreeNodes = useMemo(() => {
    return computeMessageFolderTree(filteredMessageFolders);
  }, [filteredMessageFolders]);

  const allFoldersToggled = useMemo(() => {
    return filteredMessageFolders.every((folder) => folder.isSynced);
  }, [filteredMessageFolders]);

  const handleToggleAllFolders = async (
    messageFoldersToToggle: MessageFolder[],
  ) => {
    if (messageFoldersToToggle.length === 0) return;

    const allSynced = messageFoldersToToggle.every((folder) => folder.isSynced);
    const targetSyncState = !allSynced;

    try {
      await updateMessageFoldersSyncStatus({
        messageFolderIds: messageFoldersToToggle.map((folder) => folder.id),
        isSynced: targetSyncState,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  const handleToggleFolder = async (folderToToggle: MessageFolder) => {
    const isSynced = !folderToToggle.isSynced;
    const folderIdsToToggle = computeFolderIdsForSyncToggle({
      folderId: folderToToggle.id,
      allFolders: messageFolders,
      isSynced,
    });

    try {
      await updateMessageFoldersSyncStatus({
        messageFolderIds: folderIdsToToggle,
        isSynced,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  if (loading) {
    return (
      <Section>
        <Table>
          <SettingsMessageFoldersSkeletonLoader />
        </Table>
      </Section>
    );
  }

  if (messageFolders.length === 0) {
    return <SettingsMessageFoldersEmptyStateCard />;
  }

  return (
    <Section>
      <Table>
        <StyledSearchInputContainer>
          <SettingsTextInput
            placeholder={t`Search folders...`}
            value={search}
            onChange={setSearch}
            instanceId={'message-folders-search'}
          />
        </StyledSearchInputContainer>
        <StyledLabelContainer>
          <Label>{t`Folders`}</Label>
        </StyledLabelContainer>

        <StyledSectionHeader>
          <Label>{t`Toggle all folders`}</Label>
          <TableCell
            align="right"
            padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
          >
            <Checkbox
              checked={allFoldersToggled}
              onChange={() => handleToggleAllFolders(messageFolders)}
              size={CheckboxSize.Small}
            />
          </TableCell>
        </StyledSectionHeader>

        <StyledFoldersContainer>
          <StyledTreeList>
            {folderTreeNodes.map((rootFolder) => (
              <SettingsMessageFoldersTreeItem
                key={rootFolder.folder.id}
                folderTreeNode={rootFolder}
                onToggleFolder={handleToggleFolder}
              />
            ))}
          </StyledTreeList>
        </StyledFoldersContainer>
      </Table>
    </Section>
  );
};
