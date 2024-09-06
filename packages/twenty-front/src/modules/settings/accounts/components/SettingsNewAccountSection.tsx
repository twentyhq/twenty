import { H2Title } from 'twenty-ui';

import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <H2Title
        title="Nova conta"
        description="Conecte uma nova conta ao seu workspace"
      />
      <SettingsAccountsListEmptyStateCard label="Conectar uma conta Google" />
    </Section>
  );
};
