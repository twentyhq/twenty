import { BlockedEmail } from '@/accounts/types/BlockedEmail';
import { IconX } from '@/ui/display/icon';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAccountsEmailsBlocklistTableRowProps = {
  blockedEmail: BlockedEmail;
  onRemove: (id: string) => void;
};

export const SettingsAccountsEmailsBlocklistTableRow = ({
  blockedEmail,
  onRemove,
}: SettingsAccountsEmailsBlocklistTableRowProps) => {
  return (
    <TableRow key={blockedEmail.id}>
      <TableCell>{blockedEmail.email}</TableCell>
      <TableCell>{blockedEmail.blocked_at}</TableCell>
      <TableCell align="right">
        <IconButton
          onClick={() => {
            onRemove(blockedEmail.id);
          }}
          variant="tertiary"
          size="small"
          Icon={IconX}
        />
      </TableCell>
    </TableRow>
  );
};
