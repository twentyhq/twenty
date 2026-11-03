import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { GettingStartedConnectedAccountRow } from '@/getting-started/components/GettingStartedConnectedAccountRow';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
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
      <GettingStartedConnectedAccountRow key={account.id} account={account} />
    ))}
  </Table>
);
