import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsMessageFoldersEmptyStateCard } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersEmptyStateCard';
import { SettingsMessageFoldersTableHeader } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTableHeader';
import { SettingsMessageFoldersTableRow } from '@/settings/accounts/components/message-folders/SettingsMessageFoldersTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { Section } from 'twenty-ui/layout';

type SettingsAccountsMessageFoldersCardProps = {
  messageChannelId: string;
  messageFolders: MessageFolder[];
};

const StyledTableRows = styled.div`
  max-height: 488px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAccountsMessageFoldersCard = ({
  messageFolders,
}: SettingsAccountsMessageFoldersCardProps) => {
  if (!messageFolders || messageFolders.length === 0) {
    return <SettingsMessageFoldersEmptyStateCard />;
  }

  return (
    <Section>
      <Table>
        <SettingsMessageFoldersTableHeader />
        <StyledTableRows>
          {messageFolders.map((folder) => (
            <SettingsMessageFoldersTableRow key={folder.id} folder={folder} />
          ))}
        </StyledTableRows>
      </Table>
    </Section>
  );
};
