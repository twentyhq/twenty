import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <H2Title
        title={t`New account`}
        description={t`Connect a new account to your workspace`}
      />
      <SettingsAccountsListEmptyStateCard label={t`Choose your provider`} />
    </Section>
  );
};
