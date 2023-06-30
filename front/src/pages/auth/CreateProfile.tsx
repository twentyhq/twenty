import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';

const StyledContentContainer = styled.div`
  width: 100%;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledSectionContainer = styled.div`
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledButtonContainer = styled.div`
  width: 200px;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export function CreateProfile() {
  const navigate = useNavigate();

  const handleCreate = useCallback(async () => {
    navigate('/');
  }, [navigate]);

  useHotkeys(
    'enter',
    () => {
      handleCreate();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [handleCreate],
  );

  return (
    <>
      <Title>Create profile</Title>
      <SubTitle>How you'll be identify on the app.</SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <SubSectionTitle title="Picture" />
          <ImageInput picture={null} disabled />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
            title="Name"
            description="Your name as it will be displayed on the app"
          />
          <StyledComboInputContainer>
            <TextInput
              label="First Name"
              value=""
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
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton title="Continue" onClick={handleCreate} fullWidth />
      </StyledButtonContainer>
    </>
  );
}
