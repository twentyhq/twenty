import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFolderIcon } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFolderIcon';
import { formatFolderName } from '@/settings/accounts/components/message-folders/utils/formatFolderName.util';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Checkbox, CheckboxSize } from 'twenty-ui/input';

const StyledFolderNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledTableRow = styled(TableRow)``;

const StyledCheckboxCell = styled(TableCell)`
  display: flex;
  justify-content: flex-end;
`;

type SettingsMessageFoldersTableRowProps = {
  folder: MessageFolder;
  onSyncToggle: () => void;
};

export const SettingsMessageFoldersTableRow = ({
  folder,
  onSyncToggle,
}: SettingsMessageFoldersTableRowProps) => {
  return (
    <StyledTableRow gridAutoColumns="1fr 120px">
      <TableCell>
        <StyledFolderNameCell>
          <SettingsAccountsMessageFolderIcon folder={folder} />
          {formatFolderName(folder.name)}
        </StyledFolderNameCell>
      </TableCell>
      <StyledCheckboxCell>
        <Checkbox
          checked={folder.isSynced}
          onChange={onSyncToggle}
          size={CheckboxSize.Small}
        />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
