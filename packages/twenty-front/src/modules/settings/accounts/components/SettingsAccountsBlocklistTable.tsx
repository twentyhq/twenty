import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsBlocklistTableProps = {
  blocklist: BlocklistItem[];
  handleBlockedEmailRemove: (id: string) => void;
};

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsAccountsBlocklistTable = ({
  blocklist,
  handleBlockedEmailRemove,
}: SettingsAccountsBlocklistTableProps) => {
  return (
    <>
      {blocklist.length > 0 && (
        <StyledTableContainer>
          <Table>
            <TableRow
              gridAutoColumns="200px 1fr 20px"
              mobileGridAutoColumns="120px 1fr 20px"
            >
              <TableHeader>{t`Email/Domain`}</TableHeader>
              <TableHeader>{t`Added to blocklist`}</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
            <StyledTableBodyContainer>
              <TableBody>
                {blocklist.map((blocklistItem) => (
                  <SettingsAccountsBlocklistTableRow
                    key={blocklistItem.id}
                    blocklistItem={blocklistItem}
                    onRemove={handleBlockedEmailRemove}
                  />
                ))}
              </TableBody>
            </StyledTableBodyContainer>
          </Table>
        </StyledTableContainer>
      )}
    </>
  );
};
