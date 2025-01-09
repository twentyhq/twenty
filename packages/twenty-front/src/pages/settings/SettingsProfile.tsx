import { H2Title, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangeLanguage } from '@/settings/profile/components/ChangeLanguage';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';

export const SettingsProfile = () => { 
  const { t } = useTranslation();
  return (
  <SubMenuTopBarContainer
    title={t('profile')}
    links={[
      {
        children: 'User',
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      },
      { children: 'Profile' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <H2Title title={t('picture')} />
        <ProfilePictureUploader />
      </Section>
      <Section>
        <H2Title title={t('name')} description={t('nameProfileDescription')} />
        <NameFields />
      </Section>
      <Section>
        <H2Title
          title={t('email')}
          description={t('emailProfileDescription')}
        />
        <EmailField />
      </Section>
      <Section>
        <H2Title
          title={t('language')}
          description={t('languageDescription')}
        />
        <ChangeLanguage />
      </Section>
      <Section>
        <ChangePassword />
      </Section>
      <Section>
        <DeleteAccount />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
)};
