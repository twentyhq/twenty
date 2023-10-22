import { useCallback, useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { TextInput } from '@/ui/input/components/TextInput';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type NameFieldProps = {
  autoSave?: boolean;
  onNameUpdate?: (name: string) => void;
};

export const NameField = ({
  autoSave = true,
  onNameUpdate,
}: NameFieldProps) => {
  const [currentUser] = useRecoilState(currentUserState);
  const workspace = currentUser?.workspaceMember?.workspace;

  const [displayName, setDisplayName] = useState(workspace?.displayName ?? '');

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  // TODO: Enhance this with react-hook-form (https://www.react-hook-form.com)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce(async (name: string) => {
      if (onNameUpdate) {
        onNameUpdate(displayName);
      }
      if (!autoSave || !name) {
        return;
      }
      try {
        const { data, errors } = await updateWorkspace({
          variables: {
            data: {
              displayName: name,
            },
          },
          refetchQueries: [getOperationName(GET_CURRENT_USER) ?? ''],
          awaitRefetchQueries: true,
        });

        if (errors || !data?.updateWorkspace) {
          throw errors;
        }
      } catch (error) {
        logError(error);
      }
    }, 500),
    [updateWorkspace],
  );

  useEffect(() => {
    debouncedUpdate(displayName);
    return debouncedUpdate.cancel;
  }, [debouncedUpdate, displayName]);

  return (
    <StyledComboInputContainer>
      <TextInput
        label="Name"
        value={displayName}
        onChange={setDisplayName}
        placeholder="Apple"
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
