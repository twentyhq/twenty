import {
  type MessageChannel,
  MessageChannelSyncStatus,
} from '@/accounts/types/MessageChannel';
import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SettingsMessageFoldersEmptyStateCard } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersEmptyStateCard';
import { SettingsMessageFoldersSkeletonLoader } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersSkeletonLoader';
import { SettingsMessageFoldersTreeItem } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTreeItem';
import { computeFolderIdsForSyncToggle } from '@/settings/accounts/components/message-folders/utils/computeFolderIdsForSyncToggle';
import { computeMessageFolderTree } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { useDryRunMessageFolderSync } from '@/settings/accounts/hooks/useDryRunMessageFolderSync';
import { useTriggerMessageFolderSync } from '@/settings/accounts/hooks/useTriggerMessageFolderSync';
import { useUpdateMessageFoldersSyncStatus } from '@/settings/accounts/hooks/useUpdateMessageFoldersSyncStatus';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Label } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledTreeList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledFoldersContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  padding-right: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing(1)};
  text-align: left;
`;

const StyledLabel = styled(Label)`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAccountsMessageFoldersCard = () => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const [syncingFolderIds, setSyncingFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [dryRunningFolderIds, setDryRunningFolderIds] = useState<Set<string>>(
    new Set(),
  );

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar, enqueueInfoSnackBar } =
    useSnackBar();

  const settingsAccountsSelectedMessageChannel = useRecoilValue(
    settingsAccountsSelectedMessageChannelState,
  );

  const { updateMessageFoldersSyncStatus } =
    useUpdateMessageFoldersSyncStatus();

  const [triggerMessageFolderSync] = useTriggerMessageFolderSync();
  const [dryRunMessageFolderSync] = useDryRunMessageFolderSync();

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    depth: 1,
    shouldOnlyLoadRelationIdentifiers: false,
  });

  const { record: messageChannel, loading } = useFindOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    objectRecordId: settingsAccountsSelectedMessageChannel?.id,
    recordGqlFields,
  });

  const { messageFolders = [], syncStatus } = messageChannel ?? {};

  const isChannelImporting = syncStatus === MessageChannelSyncStatus.ONGOING;

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
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
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
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
      });
    }
  };

  const handleSyncFolder = async (folderToSync: MessageFolder) => {
    setSyncingFolderIds((prev) => new Set(prev).add(folderToSync.id));

    const folderName = folderToSync.name;

    try {
      await triggerMessageFolderSync({
        variables: {
          messageFolderId: folderToSync.id,
        },
      });
      enqueueSuccessSnackBar({
        message: t`Sync started for folder "${folderName}"`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
      });
    } finally {
      setSyncingFolderIds((prev) => {
        const next = new Set(prev);
        next.delete(folderToSync.id);

        return next;
      });
    }
  };

  const isSyncingFolder = useCallback(
    (folderId: string) => syncingFolderIds.has(folderId),
    [syncingFolderIds],
  );

  const handleDryRunFolder = async (folderToDryRun: MessageFolder) => {
    setDryRunningFolderIds((prev) => new Set(prev).add(folderToDryRun.id));

    const folderName = folderToDryRun.name;

    try {
      const result = await dryRunMessageFolderSync({
        variables: {
          messageFolderId: folderToDryRun.id,
        },
      });

      const data = result.data?.dryRunMessageFolderSync;

      if (data !== undefined) {
        const messagesToImport = data.messagesToImport;
        const alreadyImported = data.alreadyImported;

        enqueueInfoSnackBar({
          message: t`${folderName}: ${messagesToImport} emails to import, ${alreadyImported} already imported`,
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
      });
    } finally {
      setDryRunningFolderIds((prev) => {
        const next = new Set(prev);
        next.delete(folderToDryRun.id);

        return next;
      });
    }
  };

  const isDryRunningFolder = useCallback(
    (folderId: string) => dryRunningFolderIds.has(folderId),
    [dryRunningFolderIds],
  );

  if (loading) {
    return (
      <Section>
        <Table>
          <SettingsMessageFoldersSkeletonLoader />
        </Table>
      </Section>
    );
  }

  if (!messageFolders || messageFolders.length === 0) {
    return <SettingsMessageFoldersEmptyStateCard />;
  }

  return (
    <Section>
      <Table>
        <StyledSearchInput
          placeholder={t`Search folders...`}
          value={search}
          onChange={setSearch}
          instanceId={'message-folders-search'}
        />
        <StyledLabel>{t`Folders`}</StyledLabel>

        <StyledSectionHeader>
          <Label>{t`Toggle all folders`}</Label>
          <StyledCheckboxCell>
            <Checkbox
              checked={allFoldersToggled}
              onChange={() => handleToggleAllFolders(messageFolders)}
              size={CheckboxSize.Small}
            />
          </StyledCheckboxCell>
        </StyledSectionHeader>

        <StyledFoldersContainer>
          <StyledTreeList>
            {folderTreeNodes.map((rootFolder) => (
              <SettingsMessageFoldersTreeItem
                key={rootFolder.folder.id}
                folderTreeNode={rootFolder}
                onToggleFolder={handleToggleFolder}
                onSyncFolder={handleSyncFolder}
                onDryRunFolder={handleDryRunFolder}
                isSyncingFolder={isSyncingFolder}
                isDryRunningFolder={isDryRunningFolder}
                isChannelImporting={isChannelImporting}
              />
            ))}
          </StyledTreeList>
        </StyledFoldersContainer>
      </Table>
    </Section>
  );
};
