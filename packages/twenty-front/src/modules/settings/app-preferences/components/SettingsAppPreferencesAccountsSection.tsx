import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import {
  SETTINGS_APP_PREFERENCES_ACCOUNTS_GRID_TEMPLATE_COLUMNS,
  SettingsAppPreferencesAccountRow,
} from '@/settings/app-preferences/components/SettingsAppPreferencesAccountRow';
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
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsAppPreferencesAccountsSectionProps = {
  accounts: ConnectedAccount[];
};

export const SettingsAppPreferencesAccountsSection = ({
  accounts,
}: SettingsAppPreferencesAccountsSectionProps) => {
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
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {sortedAccounts.length === 0 ? (
        <SettingsAccountsListEmptyStateCard />
      ) : (
        <Table>
          <TableRow
            gridTemplateColumns={
              SETTINGS_APP_PREFERENCES_ACCOUNTS_GRID_TEMPLATE_COLUMNS
            }
          >
            <TableHeader>{t`Account`}</TableHeader>
            <TableHeader align="right">{t`Used by`}</TableHeader>
            <TableHeader />
          </TableRow>
          <StyledTableRowsContainer>
            {sortedAccounts.map((account) => (
              <SettingsAppPreferencesAccountRow
                key={account.id}
                account={account}
              />
            ))}
          </StyledTableRowsContainer>
          <StyledFooter>
            <Button
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
              onClick={() => navigateSettings(SettingsPath.NewAccount)}
            >{t`Add Account`}</Button>
          </StyledFooter>
        </Table>
      )}
    </Section.Root>
  );
};
