import { H2Title, Section } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';

import { SettingsAccountsListCard } from './SettingsAccountsListCard';

export const SettingsAccountsConnectedAccountsSection = ({
  accounts,
  loading,
}: {
  accounts: ConnectedAccount[];
  loading?: boolean;
}) => (
  <Section>
    <H2Title
      title="Connected accounts"
      description="Manage your internet accounts."
    />
    <SettingsAccountsListCard
      items={accounts}
      isLoading={loading}
      RowRightComponent={SettingsAccountsRowDropdownMenu}
      hasFooter
    />
  </Section>
);
