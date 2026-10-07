import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectionStatus } from '@/settings/accounts/components/SettingsAccountsConnectionStatus';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { getAccountPermissions } from '@/settings/app-preferences/utils/getAccountPermissions';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { MOBILE_VIEWPORT, useTheme, themeCssVariables } from 'twenty-ui/theme';

const ACCOUNTS_GRID_TEMPLATE_COLUMNS = 'minmax(0, 180px) minmax(0, 1fr) 28px';

const StyledRow = styled(TableRow)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    && {
      grid-template-columns: minmax(0, 1fr) 28px;
    }

    > :first-child {
      grid-column: 1;
      grid-row: 1;
    }
    > :nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    > :last-child {
      grid-column: 2;
      grid-row: 1;
    }
  }
`;

const StyledPermissionsHeader = styled(TableHeader)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledRows = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  width: 100%;

  > svg {
    flex-shrink: 0;
  }
`;

const StyledAccountCell = styled(TableCell)`
  align-items: flex-start;
  flex-direction: column;
  min-height: ${themeCssVariables.spacing[8]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledPermissionsCell = styled(TableCell)`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesBuiltInAccountsTableProps = {
  accounts: ConnectedAccount[];
  onAddAccount: () => void;
};

export const SettingsAppPreferencesBuiltInAccountsTable = ({
  accounts,
  onAddAccount,
}: SettingsAppPreferencesBuiltInAccountsTableProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <>
      <Table>
        <StyledRow gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}>
          <TableHeader>
            <Trans>Account</Trans>
          </TableHeader>
          <StyledPermissionsHeader>
            <Trans>Permissions</Trans>
          </StyledPermissionsHeader>
          <TableHeader />
        </StyledRow>
        <StyledRows>
          {accounts.length === 0 && (
            <SettingsEmptyPlaceholder>{t`No connected accounts`}</SettingsEmptyPlaceholder>
          )}
          {accounts.map((account) => {
            const ProviderIcon = SettingsConnectedAccountIcon({ account });
            const permissions = getAccountPermissions(account);

            return (
              <StyledRow
                key={account.id}
                gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}
              >
                <StyledAccountCell
                  height="auto"
                  minWidth="0"
                  overflow="hidden"
                  color={themeCssVariables.font.color.primary}
                >
                  <StyledIdentity>
                    <ProviderIcon size={theme.icon.size.md} />
                    <OverflowingTextWithTooltip text={account.handle} />
                  </StyledIdentity>
                  {isDefined(account.archivedAt) && (
                    <SettingsAccountsConnectionStatus account={account} />
                  )}
                </StyledAccountCell>
                <StyledPermissionsCell minWidth="0" overflow="hidden">
                  <OverflowingTextWithTooltip
                    text={
                      permissions.length > 0
                        ? permissions.join(', ')
                        : t`Permissions unavailable`
                    }
                  />
                </StyledPermissionsCell>
                <TableCell align="right" padding="0">
                  <SettingsAccountsRowDropdownMenu account={account} />
                </TableCell>
              </StyledRow>
            );
          })}
        </StyledRows>
      </Table>
      <StyledFooter>
        <Button
          startIcon={<IconPlus />}
          variant="outline"
          size="sm"
          onClick={onAddAccount}
        >{t`Add account`}</Button>
      </StyledFooter>
    </>
  );
};
