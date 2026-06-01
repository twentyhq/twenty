import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';

export const SettingsAccountsEmails = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Emails`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`Emails` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsMessageChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
