import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

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
