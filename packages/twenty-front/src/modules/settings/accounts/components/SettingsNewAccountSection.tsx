import { useLingui } from '@lingui/react/macro';
import { H2Title, Section } from 'twenty-ui';

import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';

export const SettingsNewAccountSection = () => {
  const { t } = useLingui();

  return (
    <Section>
      <H2Title
        title={t`New account`}
        description={t`Connect a new account to your workspace`}
      />
      <SettingsAccountsListEmptyStateCard label={t`Connect a Google account`} />
    </Section>
  );
};
