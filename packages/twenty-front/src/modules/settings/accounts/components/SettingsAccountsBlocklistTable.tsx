import styled from '@emotion/styled';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsAccountsBlocklistTableProps = {
  blocklist: BlocklistItem[];
  handleBlockedEmailRemove: (id: string) => void;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsAccountsBlocklistTable = ({
  blocklist,
  handleBlockedEmailRemove,
}: SettingsAccountsBlocklistTableProps) => {
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
            {blocklist.map((blocklistItem) => (
              <SettingsAccountsBlocklistTableRow
                key={blocklistItem.id}
                blocklistItem={blocklistItem}
                onRemove={handleBlockedEmailRemove}
              />
            ))}
          </StyledTableBody>
        </StyledTable>
      )}
    </>
  );
};
