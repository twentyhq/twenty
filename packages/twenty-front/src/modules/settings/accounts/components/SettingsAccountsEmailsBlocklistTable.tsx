import styled from '@emotion/styled';

import { BlockedEmail } from '@/accounts/types/BlockedEmail';
import { SettingsAccountsEmailsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAccountsEmailsBlocklistTableProps = {
  blockedEmailList: BlockedEmail[];
  handleBlockedEmailRemove: (id: string) => void;
};
const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsAccountsEmailsBlocklistTable = ({
  blockedEmailList,
  handleBlockedEmailRemove,
}: SettingsAccountsEmailsBlocklistTableProps) => {
  return (
    <Table>
      <TableRow>
        <TableHeader>Email/Domain</TableHeader>
        <TableHeader>Added to blocklist</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      <StyledTableBody>
        {blockedEmailList.map((blockedEmail) => (
          <SettingsAccountsEmailsBlocklistTableRow
            key={blockedEmail.id}
            blockedEmail={blockedEmail}
            onRemove={handleBlockedEmailRemove}
          />
        ))}
      </StyledTableBody>
    </Table>
  );
};
