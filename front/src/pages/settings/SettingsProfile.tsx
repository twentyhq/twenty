import { useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { ImageInput } from '@/ui/components/inputs/ImageInput';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';
import { GET_CURRENT_USER } from '@/users/services';
import { useUpdateUserMutation } from '~/generated/graphql';

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

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');

  const [updateUser] = useUpdateUserMutation();

  // TODO: Enhance this with react-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = debounce(async () => {
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
      });

      if (errors || !data?.updateUser) {
        throw errors;
      }
    } catch (error) {
      console.error(error);
    }
  }, 500);

  useEffect(() => {
    if (
      currentUser?.firstName !== firstName ||
      currentUser?.lastName !== lastName
    ) {
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [firstName, lastName, currentUser, debouncedUpdate]);

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
              value={firstName}
              onChange={setFirstName}
              placeholder="Tim"
              fullWidth
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={setLastName}
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
