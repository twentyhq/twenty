import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { t } from '@lingui/core/macro';
import { SectionHeader } from 'twenty-ui/components';
import { Section } from 'twenty-ui/primitives/layout';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <SectionHeader
        title={t`New account`}
        description={t`Connect a new account to your workspace`}
      />
      <SettingsAccountsListEmptyStateCard />
    </Section>
  );
};
