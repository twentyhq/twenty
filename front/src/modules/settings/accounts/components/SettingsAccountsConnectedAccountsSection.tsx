import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsConnectedAccountsSection = () => (
  <Section>
    <H2Title
      title="Connected accounts"
      description="Manage your internet accounts."
    />
    <SettingsAccountsEmptyStateCard />
  </Section>
);
