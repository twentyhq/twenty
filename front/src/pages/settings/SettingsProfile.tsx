import styled from '@emotion/styled';

import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { EmailField } from '@/settings/profile/components/EmailField';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';

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
  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.Settings,
    customScopes: { 'command-menu': true, goto: false },
  });

  return (
    <NoTopBarContainer>
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
        </StyledContainer>
      </div>
    </NoTopBarContainer>
  );
}
