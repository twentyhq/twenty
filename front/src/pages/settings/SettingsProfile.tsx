import styled from '@emotion/styled';

import { DeleteAccount } from '@/settings/profile/components/DeleteAccount';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { ToggleField } from '@/settings/profile/components/ToggleField';
import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { Section } from '@/ui/section/components/Section';
import { H1Title } from '@/ui/typography/components/H1Title';
import { H2Title } from '@/ui/typography/components/H2Title';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  padding-bottom: 30px;
  width: 350px;
`;

export function SettingsProfile() {
  return (
    <SubMenuTopBarContainer icon={<IconSettings size={16} />} title="Settings">
      <>
        <StyledContainer>
          <H1Title title="Profile" />
          <Section>
            <H2Title title="Picture" />
            <ProfilePictureUploader />
          </Section>
          <Section>
            <H2Title
              title="Name"
              description="Your name as it will be displayed"
            />
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
            <H2Title
              title="Support"
              addornment={<ToggleField />}
              description="Grant Twenty support temporary access to your account so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time."
            />
          </Section>
          <Section>
            <DeleteAccount />
          </Section>
        </StyledContainer>
      </>
    </SubMenuTopBarContainer>
  );
}
