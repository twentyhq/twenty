import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsEmailsSyncSection = () => (
  <Section>
    <H2Title
      title="Emails sync"
      description="Sync your inboxes and set your privacy settings"
    />
    <SettingsAccountsEmptyStateCard />
  </Section>
);
