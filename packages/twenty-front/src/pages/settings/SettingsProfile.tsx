import styled from '@emotion/styled';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { IconSettings } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsProfile = () => {
  const { translate } = useI18n('translations');
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <StyledH1Title title={translate('profile')} />
        <Section>
          <H2Title title={translate('picture')} />
          <ProfilePictureUploader />
        </Section>
        <Section>
          <H2Title title={translate('name')} description={translate('yourNameAsItWillDisplayed')} />
          <NameFields />
        </Section>
        <Section>
          <H2Title
            title={translate('email')}
            description={translate('emailAssociatedToYourAccount')}
          />
          <EmailField />
        </Section>
        <Section>
          <ChangePassword />
        </Section>
        <Section>
          <DeleteAccount />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}

