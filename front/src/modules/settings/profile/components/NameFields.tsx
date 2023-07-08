import { useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { GET_CURRENT_USER } from '@/users/queries';
import { useUpdateUserMutation } from '~/generated/graphql';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export function NameFields() {
  const currentUser = useRecoilValue(currentUserState);

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');

  const [updateUser] = useUpdateUserMutation();

  // TODO: Enhance this with react-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = debounce(async () => {
    try {
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
