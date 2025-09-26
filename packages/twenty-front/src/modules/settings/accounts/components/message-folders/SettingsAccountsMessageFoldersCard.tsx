import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsMessageFoldersEmptyStateCard } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersEmptyStateCard';
import { SettingsMessageFoldersTableRow } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTableRow';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Label } from 'twenty-ui/display';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledTableRows = styled.div`
  max-height: 300px;
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
  padding: 0 ${({ theme }) => theme.spacing(1)};
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

  const settingsAccountsSelectedMessageChannel = useRecoilValue(
    settingsAccountsSelectedMessageChannelState,
  );

  const { updateOneRecord } = useUpdateOneRecord<MessageFolder>({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
  });

  const { record: messageChannel } = useFindOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    objectRecordId: settingsAccountsSelectedMessageChannel?.id,
  });

  const { messageFolders = [] } = messageChannel ?? {};

  const filteredMessageFolders = useMemo(() => {
    return messageFolders.filter((folder) =>
      folder.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [messageFolders, search]);

  const allFoldersToggled = useMemo(() => {
    return filteredMessageFolders.every((folder) => folder.isSynced);
  }, [filteredMessageFolders]);

  const handleToggleAllFolders = async (
    messageFoldersToToggle: MessageFolder[],
  ) => {
    if (messageFoldersToToggle.length === 0) return;

    const allSynced = messageFoldersToToggle.every((folder) => folder.isSynced);
    const targetSyncState = !allSynced;

    for (const folder of messageFoldersToToggle) {
      await updateOneRecord({
        idToUpdate: folder.id,
        updateOneRecordInput: { isSynced: targetSyncState },
      });
    }
  };

  const handleToggleFolder = async (messageFoldersToToggle: MessageFolder) => {
    await updateOneRecord({
      idToUpdate: messageFoldersToToggle.id,
      updateOneRecordInput: {
        isSynced: !messageFoldersToToggle.isSynced,
      },
    });
  };

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

        <StyledTableRows>
          {filteredMessageFolders?.map((folder) => (
            <SettingsMessageFoldersTableRow
              key={folder.id}
              folder={folder}
              onSyncToggle={() => handleToggleFolder(folder)}
            />
          ))}
        </StyledTableRows>
      </Table>
    </Section>
  );
};
