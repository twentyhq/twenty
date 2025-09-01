import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconFolder, IconSend } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';

const StyledFolderNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

type SettingsMessageFoldersTableRowProps = {
  folder: MessageFolder;
};

export const SettingsMessageFoldersTableRow = ({
  folder,
}: SettingsMessageFoldersTableRowProps) => {
  const theme = useTheme();
  const { updateOneRecord } = useUpdateOneRecord<MessageFolder>({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
  });

  const handleSyncToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: folder.id,
      updateOneRecordInput: {
        isSynced: value,
      },
    });
  };

  const formatName = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <StyledTableRow gridAutoColumns="1fr 120px 70px">
      <TableCell>
        <StyledFolderNameCell>
          {folder.isSentFolder ? (
            <IconSend size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          ) : (
            <IconFolder
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {formatName(folder.name)}
        </StyledFolderNameCell>
      </TableCell>
      <TableCell align="center">
        <Toggle
          value={folder.isSynced}
          onChange={handleSyncToggle}
          toggleSize="small"
        />
      </TableCell>
    </StyledTableRow>
  );
};
