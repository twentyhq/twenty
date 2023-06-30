import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
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

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export function SettingsProfile() {
  const currentUser = useRecoilValue(currentUserState);
  return (
    <NoTopBarContainer>
      <StyledContainer>
        <MainSectionTitle>Profile</MainSectionTitle>
        <StyledSectionContainer>
          <SubSectionTitle title="Picture" />
          <ImageInput picture={null} disabled />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
            title="Name"
            description="Your name as it will be displayed"
          />
          <StyledComboInputContainer>
            <TextInput
              label="First Name"
              value={currentUser?.displayName}
              placeholder="Tim"
              fullWidth
            />
            <TextInput
              label="Last Name"
              value=""
              placeholder="Cook"
              fullWidth
            />
          </StyledComboInputContainer>
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
            title="Email"
            description="The email associated to your account"
          />
          <TextInput
            value={currentUser?.email}
            disabled
            fullWidth
            key={'email-' + currentUser?.id}
          />
        </StyledSectionContainer>
      </StyledContainer>
    </NoTopBarContainer>
  );
}
