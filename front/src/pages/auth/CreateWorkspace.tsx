import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { currentUserState } from '@/auth/states/currentUserState';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/services';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

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

  const [currentUser] = useRecoilState(currentUserState);

  const [workspaceName, setWorkspaceName] = useState('');

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleCreate = useCallback(async () => {
    try {
      if (!workspaceName) {
        throw new Error('Workspace name is required');
      }

      const { data, errors } = await updateWorkspace({
        variables: {
          data: {
            displayName: {
              set: workspaceName,
            },
          },
        },
        refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
      });

      if (errors || !data?.updateWorkspace) {
        throw errors;
      }

      navigate('/auth/create/profile');
    } catch (error) {
      console.error(error);
    }
  }, [navigate, updateWorkspace, workspaceName]);

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

  useEffect(() => {
    if (!currentUser || currentUser?.workspaceMember?.workspace?.displayName) {
      navigate('/auth/create/profile');
    }
  }, [currentUser, navigate]);

  return (
    <>
      <Title>Create your workspace</Title>
      <SubTitle>
        A shared environment where you will be able to manage your customer
        relations with your team.
      </SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <SubSectionTitle title="Workspace logo" />
          <ImageInput picture={null} disabled />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
            title="Workspace name"
            description="The name of your organization"
          />
          <TextInput
            value={workspaceName}
            placeholder="Apple"
            onChange={setWorkspaceName}
            fullWidth
          />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title="Continue"
          onClick={handleCreate}
          disabled={!workspaceName}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
}
