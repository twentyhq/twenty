import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';
import { Section } from 'twenty-ui';

export const SettingsAccountsEmails = () => {
  const { t } = useTranslation();
  return(
  <SubMenuTopBarContainer
    title={t('emails')}
    links={[
      {
        children: t('user'),
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      },
      {
        children: t('account'),
        href: getSettingsPagePath(SettingsPath.Accounts),
      },
      { children: t('emails') },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <SettingsAccountsMessageChannelsContainer />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
)};
