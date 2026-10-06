import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import {
  SETTINGS_APP_PREFERENCES_CONNECTED_ACCOUNTS_GRID_TEMPLATE_COLUMNS,
  SettingsAppPreferencesConnectedAccountRow,
} from '@/settings/app-preferences/components/SettingsAppPreferencesConnectedAccountRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesConnectedAccountsSectionProps = {
  accounts: ConnectedAccount[];
};

export const SettingsAppPreferencesConnectedAccountsSection = ({
  accounts,
}: SettingsAppPreferencesConnectedAccountsSectionProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  // The same handle connected through several apps sits together, so a member
  // sees at a glance which apps use each of their accounts.
  const sortedAccounts = [...accounts].sort(
    (accountA, accountB) =>
      accountA.handle.localeCompare(accountB.handle) ||
      accountA.provider.localeCompare(accountB.provider),
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Connected accounts`}
        description={t`Every account you connected, across all your apps.`}
      />
      {sortedAccounts.length === 0 ? (
        <SettingsAccountsListEmptyStateCard />
      ) : (
        <>
          <Table>
            <TableRow
              gridTemplateColumns={
                SETTINGS_APP_PREFERENCES_CONNECTED_ACCOUNTS_GRID_TEMPLATE_COLUMNS
              }
            >
              <TableHeader>{t`Account`}</TableHeader>
              <TableHeader>{t`App`}</TableHeader>
              <TableHeader align="right">{t`Status`}</TableHeader>
            </TableRow>
            <StyledTableRowsContainer>
              {sortedAccounts.map((account) => (
                <SettingsAppPreferencesConnectedAccountRow
                  key={account.id}
                  account={account}
                />
              ))}
            </StyledTableRowsContainer>
          </Table>
          <StyledFooter>
            <Button
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
              onClick={() => navigateSettings(SettingsPath.NewAccount)}
            >{t`Add account`}</Button>
          </StyledFooter>
        </>
      )}
    </Section.Root>
  );
};
