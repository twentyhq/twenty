import { type BlocklistItem } from '@/accounts/types/BlocklistItem';
import { SettingsAccountsBlocklistTableRow } from '@/settings/accounts/components/SettingsAccountsBlocklistTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { IconX, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { IconButton } from 'twenty-ui/input';

type SettingsAccountsBlocklistTableProps = {
  redirectUris: string[];
  updateRedirectUris: (redirectUris: string[]) => void;
};

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsApplicationRegistrationRedirectURIsTable = ({
  redirectUris,
  updateRedirectUris,
}: SettingsAccountsBlocklistTableProps) => {
  return (
    <>
      {redirectUris.length > 0 && (
        <StyledTableContainer>
          <Table>
            <TableRow
              gridAutoColumns="200px 1fr 20px"
              mobileGridAutoColumns="120px 1fr 20px"
            >
              <TableHeader>{t`URI`}</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
            <StyledTableBodyContainer>
              <TableBody>
                {redirectUris.map((redirectUri) => (
                  <TableRow
                    key={redirectUri}
                    gridAutoColumns="1fr 20px"
                    mobileGridAutoColumns="1fr 20px"
                  >
                    <TableCell>
                      <OverflowingTextWithTooltip text={redirectUri} />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          updateRedirectUris(
                            redirectUris.filter((uri) => uri !== redirectUri),
                          );
                        }}
                        variant="tertiary"
                        size="small"
                        Icon={IconX}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </StyledTableBodyContainer>
          </Table>
        </StyledTableContainer>
      )}
    </>
  );
};
