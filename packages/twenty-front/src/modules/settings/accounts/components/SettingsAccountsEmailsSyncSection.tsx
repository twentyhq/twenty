import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';
import { mockedAccounts as accounts } from '~/testing/mock-data/accounts';

import { SettingsAccountsEmailsCard } from './SettingsAccountsEmailsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsEmailsSyncSection = () => {
  const { translate } = useI18n('translations');
  return (
    <Section>
      <H2Title
        title={translate('emailsSync')}
        description={translate('emailsSyncDes')}
      />
      {accounts.length ? (
        <SettingsAccountsEmailsCard accounts={accounts} />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
