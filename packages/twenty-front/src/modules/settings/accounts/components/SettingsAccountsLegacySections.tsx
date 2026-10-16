import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { SettingsTableRowsSkeletonLoader } from '@/settings/components/SettingsTableRowsSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';

export const SettingsAccountsLegacySections = () => {
  const { t } = useLingui();
  const { accounts, loading } = useMyConnectedAccounts();

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Connected accounts`}
          description={t`Manage your internet accounts.`}
        />
        {loading ? (
          <Table>
            <SettingsConnectedAccountsTableHeader />
            <SettingsTableRowsSkeletonLoader
              gridTemplateColumns="minmax(0, 1fr) auto"
              columns={[{}, { align: 'right', width: 64 }]}
            />
          </Table>
        ) : (
          <SettingsAccountsConnectedAccountsListCard accounts={accounts} />
        )}
      </Section.Root>
      <SettingsAccountsBlocklistSection />
      <SettingsAccountsSettingsSection />
    </>
  );
};
