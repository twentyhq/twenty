import styled from '@emotion/styled';

import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { MainSectionTitle } from '@/ui/title/components/MainSectionTitle';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  width: 350px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

const StyledSectionContainer = styled.div`
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

export function SettingsProfile() {
  return (
    <SubMenuTopBarContainer>
      <div>
        <StyledContainer>
          <MainSectionTitle>Profile</MainSectionTitle>
          <StyledSectionContainer>
            <SubSectionTitle title="Picture" />
            <ProfilePictureUploader />
          </StyledSectionContainer>
          <StyledSectionContainer>
            <SubSectionTitle
              title="Name"
              description="Your name as it will be displayed"
            />
            <NameFields />
          </StyledSectionContainer>
          <StyledSectionContainer>
            <SubSectionTitle
              title="Email"
              description="The email associated to your account"
            />
            <EmailField />
          </StyledSectionContainer>

          <StyledSectionContainer>
            <DeleteWorkspace />
          </StyledSectionContainer>
        </StyledContainer>
      </div>
    </SubMenuTopBarContainer>
  );
}
