import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentUserState } from '@/auth/states/currentUserState';
import { isMockModeState } from '@/auth/states/isMockModeState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useHotkeysScopeOnMountOnly } from '@/hotkeys/hooks/useHotkeysScopeOnMountOnly';
import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { NameFields } from '@/settings/profile/components/NameFields';
import { ProfilePictureUploader } from '@/settings/profile/components/ProfilePictureUploader';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateUserMutation } from '~/generated/graphql';

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

export function CreateProfile() {
  useHotkeysScopeOnMountOnly({
    scope: InternalHotkeysScope.CreateProfile,
    customScopes: { 'command-menu': false, goto: false },
  });
  const navigate = useNavigate();
  const [, setMockMode] = useRecoilState(isMockModeState);
  const onboardingStatus = useOnboardingStatus();

  const [currentUser] = useRecoilState(currentUserState);

  const [updateUser] = useUpdateUserMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleCreate = useCallback(async () => {
    try {
      if (!currentUser?.id) {
        throw new Error('User is not logged in');
      }

      const { data, errors } = await updateUser({
        variables: {
          where: {
            id: currentUser?.id,
          },
          data: {
            firstName: {
              set: firstName,
            },
            lastName: {
              set: lastName,
            },
          },
        },
        refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
        awaitRefetchQueries: true,
      });

      if (errors || !data?.updateUser) {
        throw errors;
      }

      navigate('/');
    } catch (error) {
      console.error(error);
    }
  }, [currentUser?.id, firstName, lastName, navigate, updateUser]);

  useScopedHotkeys(
    Key.Enter,
    () => {
      handleCreate();
    },
    InternalHotkeysScope.CreateProfile,
    [handleCreate],
  );

  useEffect(() => {
    setMockMode(true);
    if (onboardingStatus !== OnboardingStatus.OngoingProfileCreation) {
      navigate('/');
    }
  }, [onboardingStatus, navigate, setMockMode]);

  return (
    <>
      <Title>Create profile</Title>
      <SubTitle>How you'll be identified on the app.</SubTitle>
      <StyledContentContainer>
        <StyledSectionContainer>
          <SubSectionTitle title="Picture" />
          <ProfilePictureUploader />
        </StyledSectionContainer>
        <StyledSectionContainer>
          <SubSectionTitle
            title="Name"
            description="Your name as it will be displayed on the app"
          />
          <NameFields
            autoSave={false}
            onFirstNameUpdate={setFirstName}
            onLastNameUpdate={setLastName}
          />
        </StyledSectionContainer>
      </StyledContentContainer>
      <StyledButtonContainer>
        <MainButton
          title="Continue"
          onClick={handleCreate}
          disabled={!firstName || !lastName}
          fullWidth
        />
      </StyledButtonContainer>
    </>
  );
}
