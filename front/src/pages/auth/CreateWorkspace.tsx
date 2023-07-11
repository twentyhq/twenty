import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { isMockModeState } from '@/auth/states/isMockModeState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
// import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/queries';
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
  const [, setMockMode] = useRecoilState(isMockModeState);
  const navigate = useNavigate();
  const onboardingStatus = useOnboardingStatus();

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
        awaitRefetchQueries: true,
      });

      if (errors || !data?.updateWorkspace) {
        throw errors;
      }

      navigate('/auth/create/profile');
    } catch (error) {
      console.error(error);
    }
  }, [navigate, updateWorkspace, workspaceName]);

  useScopedHotkeys(
    'enter',
    () => {
      handleCreate();
    },
    InternalHotkeysScope.CreateWokspace,
    [handleCreate],
  );

  useEffect(() => {
    setMockMode(true);
    if (onboardingStatus !== OnboardingStatus.OngoingWorkspaceCreation) {
      navigate('/auth/create/profile');
    }
  }, [onboardingStatus, navigate, setMockMode]);

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
          <WorkspaceLogoUploader />
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
