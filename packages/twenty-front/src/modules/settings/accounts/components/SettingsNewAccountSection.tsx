import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { Section } from 'twenty-ui/components/layout';
import { useLingui } from '@lingui/react/macro';

export const SettingsNewAccountSection = () => {
  const { t } = useLingui();
  return (
    <Section.Root>
      <Section.Header
        title={t`New account`}
        description={t`Connect a new account to your workspace`}
      />
      <SettingsAccountsListEmptyStateCard />
    </Section.Root>
  );
};
