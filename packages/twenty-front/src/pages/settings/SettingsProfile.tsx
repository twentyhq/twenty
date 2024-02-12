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
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsProfile = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <SettingsPageContainer>
      <StyledH1Title title="Profile" />
      <Section>
        <H2Title title="Picture" />
        <ProfilePictureUploader />
      </Section>
      <Section>
        <H2Title title="Name" description="Your name as it will be displayed" />
        <NameFields />
      </Section>
      <Section>
        <H2Title
          title="Email"
          description="The email associated to your account"
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
