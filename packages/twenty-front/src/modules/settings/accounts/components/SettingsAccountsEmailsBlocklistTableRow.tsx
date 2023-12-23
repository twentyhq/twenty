import { IconX } from '@/ui/display/icon';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { BlockedEmail } from '@/accounts/types/BlockedEmail';
import { IconButton } from '@/ui/input/button/components/IconButton';

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
