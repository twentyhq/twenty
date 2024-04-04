import { IconX } from 'twenty-ui';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { formatToHumanReadableDate } from '~/utils';

type SettingsAccountsEmailsBlocklistTableRowProps = {
  blocklistItem: BlocklistItem;
  onRemove: (id: string) => void;
};

export const SettingsAccountsEmailsBlocklistTableRow = ({
  blocklistItem,
  onRemove,
}: SettingsAccountsEmailsBlocklistTableRowProps) => {
  return (
    <TableRow key={blocklistItem.id}>
      <TableCell>{blocklistItem.handle}</TableCell>
      <TableCell>
        {formatToHumanReadableDate(blocklistItem.createdAt)}
      </TableCell>
      <TableCell align="right">
        <IconButton
          onClick={() => {
            onRemove(blocklistItem.id);
          }}
          variant="tertiary"
          size="small"
          Icon={IconX}
        />
      </TableCell>
    </TableRow>
  );
};
