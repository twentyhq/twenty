import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';
import { Section } from 'twenty-ui';

export const SettingsAccountsCalendars = () => {
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer
      title={t('calendars')}
      links={[
        {
          children: t('user'),
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: t('account'),
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        { children: t('calendars') },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
