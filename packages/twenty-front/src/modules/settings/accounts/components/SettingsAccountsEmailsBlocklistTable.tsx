import styled from '@emotion/styled';

import { BlockListItem } from '@/accounts/types/BlockListItem';
import { SettingsAccountsEmailsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAccountsEmailsBlocklistTableProps = {
  blocklist: BlockListItem[];
  handleBlockedEmailRemove: (id: string) => void;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsAccountsEmailsBlocklistTable = ({
  blocklist,
  handleBlockedEmailRemove,
}: SettingsAccountsEmailsBlocklistTableProps) => {
  return (
    <>
      {blocklist.length > 0 && (
        <StyledTable>
          <TableRow>
            <TableHeader>Email/Domain</TableHeader>
            <TableHeader>Added to blocklist</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
          <StyledTableBody>
            {blocklist.map((blockListItem) => (
              <SettingsAccountsEmailsBlocklistTableRow
                key={blockListItem.id}
                blockListItem={blockListItem}
                onRemove={handleBlockedEmailRemove}
              />
            ))}
          </StyledTableBody>
        </StyledTable>
      )}
    </>
  );
};
