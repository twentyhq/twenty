import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import useI18n from '@/ui/i18n/useI18n';
import { TextInput } from '@/ui/input/components/TextInput';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type NameFieldsProps = {
  autoSave?: boolean;
  onFirstNameUpdate?: (firstName: string) => void;
  onLastNameUpdate?: (lastName: string) => void;
};

export const NameFields = ({
  autoSave = true,
  onFirstNameUpdate,
  onLastNameUpdate,
}: NameFieldsProps) => {
  const currentUser = useRecoilValue(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { translate } = useI18n('translations');
  const [firstName, setFirstName] = useState(
    currentWorkspaceMember?.name?.firstName ?? '',
  );
  const [lastName, setLastName] = useState(
    currentWorkspaceMember?.name?.lastName ?? '',
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = debounce(async () => {
    if (onFirstNameUpdate) {
      onFirstNameUpdate(firstName);
    }
    if (onLastNameUpdate) {
      onLastNameUpdate(lastName);
    }
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error(translate('userIsNotLoggedIn'));
      }

      if (autoSave) {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            name: {
              firstName: firstName,
              lastName: lastName,
            },
          },
        });

        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          name: {
            firstName,
            lastName,
          },
        });
      }
    } catch (error) {
      logError(error);
    }
  }, 500);

  useEffect(() => {
    if (!currentWorkspaceMember) {
      return;
    }

    if (
      currentWorkspaceMember.name?.firstName !== firstName ||
      currentWorkspaceMember.name?.lastName !== lastName
    ) {
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [
    firstName,
    lastName,
    currentUser,
    debouncedUpdate,
    autoSave,
    currentWorkspaceMember,
  ]);

  return (
    <StyledComboInputContainer>
      <TextInput
        label={translate('firstName')}
        value={firstName}
        onChange={setFirstName}
        placeholder={translate('amir')}
        fullWidth
      />
      <TextInput
        label={translate('lastName')}
        value={lastName}
        onChange={setLastName}
        placeholder={translate('azizi')}
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
