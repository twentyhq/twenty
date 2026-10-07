import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsAccountUsage } from '@/settings/accounts/components/SettingsAccountsAccountUsage';
import { SettingsAccountsConnectionStatus } from '@/settings/accounts/components/SettingsAccountsConnectionStatus';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { MOBILE_VIEWPORT, useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const ACCOUNTS_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) auto minmax(80px, max-content) 28px';

const StyledUsageHeader = styled(TableHeader)`
  white-space: nowrap;
`;

const StyledStatusHeader = styled(TableHeader)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledAccountsTableRow = styled(TableRow)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    && {
      grid-template-columns: minmax(0, 1fr) minmax(80px, max-content) 28px;
      grid-template-areas:
        'account usage menu'
        'status . .';
    }

    > :nth-child(1) {
      grid-area: account;
    }

    > :nth-child(2) {
      grid-area: status;
      height: auto;
      justify-content: flex-start;
      padding-bottom: ${themeCssVariables.spacing[2]};
    }

    > :nth-child(3) {
      grid-area: usage;
    }

    > :nth-child(4) {
      grid-area: menu;
    }
  }
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddAccountSectionContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAccountsConnectedAccountsTableProps = {
  accounts: ConnectedAccount[];
};

export const SettingsAccountsConnectedAccountsTable = ({
  accounts,
}: SettingsAccountsConnectedAccountsTableProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <Section.Root>
      <Table>
        <StyledAccountsTableRow
          gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}
        >
          <TableHeader>
            <Trans>Account</Trans>
          </TableHeader>
          <StyledStatusHeader />
          <StyledUsageHeader align="right">
            <Trans>Used by</Trans>
          </StyledUsageHeader>
          <TableHeader />
        </StyledAccountsTableRow>
        <StyledTableRows>
          {accounts.map((account) => {
            const ProviderIcon = SettingsConnectedAccountIcon({ account });

            return (
              <StyledAccountsTableRow
                key={account.id}
                gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}
              >
                <TableCell
                  color={themeCssVariables.font.color.primary}
                  gap={themeCssVariables.spacing[2]}
                  minWidth="0"
                  overflow="hidden"
                >
                  <ProviderIcon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                  <OverflowingTextWithTooltip text={account.handle} />
                </TableCell>
                <TableCell align="right">
                  <SettingsAccountsConnectionStatus account={account} />
                </TableCell>
                <TableCell align="right">
                  <SettingsAccountsAccountUsage account={account} />
                </TableCell>
                <TableCell align="right" padding="0">
                  <SettingsAccountsRowDropdownMenu account={account} />
                </TableCell>
              </StyledAccountsTableRow>
            );
          })}
        </StyledTableRows>
      </Table>
      <StyledAddAccountSectionContainer>
        <Button
          startIcon={<IconPlus />}
          size="sm"
          onClick={() => navigateSettings(SettingsPath.NewAccount)}
          variant="outline"
        >{t`Add account`}</Button>
      </StyledAddAccountSectionContainer>
    </Section.Root>
  );
};
