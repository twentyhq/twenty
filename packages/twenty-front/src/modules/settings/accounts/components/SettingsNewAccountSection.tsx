import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsNewAccountSection = () => {
  const { translate } = useI18n('translations');
  return (
    <Section>
      <H2Title
        title={translate('newAccount')}
        description={translate('connectNewAccountYourWorkspace')}
      />
      <SettingsAccountsEmptyStateCard
        label={translate('connectGoogleAccount')}
      />
    </Section>
  );
};
