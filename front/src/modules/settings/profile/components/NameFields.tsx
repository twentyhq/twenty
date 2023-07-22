import { useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInput } from '@/ui/input/components/TextInput';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateUserMutation } from '~/generated/graphql';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type OwnProps = {
  autoSave?: boolean;
  onFirstNameUpdate?: (firstName: string) => void;
  onLastNameUpdate?: (lastName: string) => void;
};

export function NameFields({
  autoSave = true,
  onFirstNameUpdate,
  onLastNameUpdate,
}: OwnProps) {
  const currentUser = useRecoilValue(currentUserState);

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');

  const [updateUser] = useUpdateUserMutation();

  // TODO: Enhance this with react-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = debounce(async () => {
    if (onFirstNameUpdate) {
      onFirstNameUpdate(firstName);
    }
    if (onLastNameUpdate) {
      onLastNameUpdate(lastName);
    }
    try {
      if (autoSave) {
        const { data, errors } = await updateUser({
          variables: {
            where: {
              id: currentUser?.id,
            },
            data: {
              firstName,
              lastName,
            },
          },
          refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
        });

        if (errors || !data?.updateUser) {
          throw errors;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, 500);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (
      currentUser.firstName !== firstName ||
      currentUser.lastName !== lastName
    ) {
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [firstName, lastName, currentUser, debouncedUpdate, autoSave]);

  return (
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
  );
}
