import { useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { SubTitle } from '@/auth/components/ui/SubTitle';
import { Title } from '@/auth/components/ui/Title';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
import { MainButton } from '@/ui/components/buttons/MainButton';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { GET_CURRENT_USER } from '@/users/services';
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

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export function CreateProfile() {
  const navigate = useNavigate();
  const onboardingStatus = useOnboardingStatus();

  const [currentUser] = useRecoilState(currentUserState);
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );

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

      setCaptureHotkeyTypeInFocus(false);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  }, [
    currentUser?.id,
    firstName,
    lastName,
    navigate,
    setCaptureHotkeyTypeInFocus,
    updateUser,
  ]);

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
    if (onboardingStatus !== OnboardingStatus.OngoingProfileCreation) {
      navigate('/');
    }
  }, [onboardingStatus, navigate]);

  useEffect(() => {
    setCaptureHotkeyTypeInFocus(true);
  }, [setCaptureHotkeyTypeInFocus]);

  return (
    <>
      <Title>Create profile</Title>
      <SubTitle>How you'll be identified on the app.</SubTitle>
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
              value={firstName}
              placeholder="Tim"
              onChange={setFirstName}
              fullWidth
            />
            <TextInput
              label="Last Name"
              value={lastName}
              placeholder="Cook"
              onChange={setLastName}
              fullWidth
            />
          </StyledComboInputContainer>
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
