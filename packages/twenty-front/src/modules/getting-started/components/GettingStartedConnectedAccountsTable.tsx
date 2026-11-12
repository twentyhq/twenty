import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GettingStartedConnectedAccountSettingsButton } from '@/getting-started/components/GettingStartedConnectedAccountSettingsButton';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { Table } from '@/ui/layout/table/components/Table';

type GettingStartedConnectedAccountsTableProps = {
  accounts: ConnectedAccount[];
};

export const GettingStartedConnectedAccountsTable = ({
  accounts,
}: GettingStartedConnectedAccountsTableProps) => (
  <Table>
    <SettingsConnectedAccountsTableHeader />
    {accounts.map((account) => (
      <SettingsConnectedAccountsTableRow
        key={account.id}
        account={account}
        action={
          <GettingStartedConnectedAccountSettingsButton account={account} />
        }
      />
    ))}
  </Table>
);
