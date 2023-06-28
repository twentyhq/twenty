import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { Section } from '@/auth/components/ui/Section';
import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';

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

export function CreateWorkspace() {
  const navigate = useNavigate();

  const handleCreate = useCallback(async () => {
    navigate('/auth/create-profile');
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
      <Title>Create your workspace</Title>
      <SubTitle>
        A shared environment where you will be able to manage your customer
        relations with your team.
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <Section title="Workspace logo" />
          <ImageInput picture={null} disabled />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <Section
            title="Workspace name"
            description="The name of your organization"
          />
          <TextInput value="" placeholder="Apple" fullWidth />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton title="Continue" onClick={handleCreate} fullWidth />
      </StyledButtonContainer>
    </>
  );
}
