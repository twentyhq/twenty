import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

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
