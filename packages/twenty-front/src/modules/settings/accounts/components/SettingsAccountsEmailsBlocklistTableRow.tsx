import { BlockListItem } from '@/accounts/types/BlockListItem';
import { IconX } from '@/ui/display/icon';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAccountsEmailsBlocklistTableRowProps = {
  blockListItem: BlockListItem;
  onRemove: (id: string) => void;
};

export const SettingsAccountsEmailsBlocklistTableRow = ({
  blockListItem,
  onRemove,
}: SettingsAccountsEmailsBlocklistTableRowProps) => {
  return (
    <TableRow key={blockListItem.id}>
      <TableCell>{blockListItem.handle}</TableCell>
      <TableCell>{blockListItem.createdAt}</TableCell>
      <TableCell align="right">
        <IconButton
          onClick={() => {
            onRemove(blockListItem.id);
          }}
          variant="tertiary"
          size="small"
          Icon={IconX}
        />
      </TableCell>
    </TableRow>
  );
};
