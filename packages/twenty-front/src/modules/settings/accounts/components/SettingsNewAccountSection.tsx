import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsNewAccountSection = () => {
  return (
    <Section>
      <H2Title
        title="New account"
        description="Connect a new account to your workspace"
      />
      <SettingsAccountsEmptyStateCard label="Connect a Google account" />
    </Section>
  );
};
