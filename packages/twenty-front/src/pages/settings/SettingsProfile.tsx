import { H2Title, IconUserCircle } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ChangePassword } from '@/settings/profile/components/ChangePassword';
import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsProfile = () => (
  <SubMenuTopBarContainer Icon={IconUserCircle} title="Profile">
    <SettingsPageContainer>
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
