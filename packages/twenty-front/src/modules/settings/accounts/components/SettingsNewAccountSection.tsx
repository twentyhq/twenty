import { H2Title, Section } from 'twenty-ui';

import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <H2Title
        title="New account"
        description="Connect a new account to your workspace"
      />
      <SettingsAccountsListEmptyStateCard label="Connect a Google account" />
    </Section>
  );
};
