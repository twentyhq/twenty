import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { IconButton, IconX, OverflowingTextWithTooltip } from 'twenty-ui';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type SettingsAccountsBlocklistTableRowProps = {
  blocklistItem: BlocklistItem;
  onRemove: (id: string) => void;
};

export const SettingsAccountsBlocklistTableRow = ({
  blocklistItem,
  onRemove,
}: SettingsAccountsBlocklistTableRowProps) => {
  return (
    <TableRow
      key={blocklistItem.id}
      gridAutoColumns="200px 1fr 20px"
      mobileGridAutoColumns="120px 1fr 20px"
    >
      <TableCell>
        <OverflowingTextWithTooltip text={blocklistItem.handle} />
      </TableCell>
      <TableCell>
        {blocklistItem.createdAt
          ? formatToHumanReadableDate(blocklistItem.createdAt)
          : ''}
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
