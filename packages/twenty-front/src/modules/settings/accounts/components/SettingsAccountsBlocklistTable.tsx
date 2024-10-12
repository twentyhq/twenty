import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { MOBILE_VIEWPORT } from 'twenty-ui';

type SettingsAccountsBlocklistTableProps = {
  blocklist: BlocklistItem[];
  handleBlockedEmailRemove: (id: string) => void;
};

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableHeader = styled(TableHeader)`
  width: 100%;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    white-space: pre;
    margin-left: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledTableBody = styled.tbody`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 60%;
  }
`;
export const SettingsAccountsBlocklistTable = ({
  blocklist,
  handleBlockedEmailRemove,
}: SettingsAccountsBlocklistTableProps) => {
  const theme = useTheme();
  return (
    <>
      {blocklist.length > 0 && (
        <StyledTable>
          <TableRow gridAutoColumns={`1fr 1fr ${theme.spacing(16)}`}>
            <TableHeader>Email/Domain</TableHeader>
            <StyledTableHeader align={'right'}>
              Added to blocklist
            </StyledTableHeader>
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
