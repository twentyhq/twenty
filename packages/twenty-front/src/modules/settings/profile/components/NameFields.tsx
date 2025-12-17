import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
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
};

export const NameFields = ({ autoSave = true }: NameFieldsProps) => {
  const { t } = useLingui();
  const currentUser = useRecoilValue(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { canEdit: canEditFirstName } = useCanEditProfileField('firstName');
  const { canEdit: canEditLastName } = useCanEditProfileField('lastName');

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
  const debouncedUpdate = useDebouncedCallback(async () => {
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
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

    const { firstName: currentFirstName, lastName: currentLastName } =
      currentWorkspaceMember.name;

    if (
      (currentFirstName !== firstName || currentLastName !== lastName) &&
      firstName !== '' &&
      lastName !== ''
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
    canEditFirstName,
    canEditLastName,
  ]);

  const firstNameTextInputId = `${currentWorkspaceMember?.id}-first-name`;
  const lastNameTextInputId = `${currentWorkspaceMember?.id}-last-name`;

  return (
    <StyledComboInputContainer>
      <SettingsTextInput
        instanceId={firstNameTextInputId}
        label={t`First Name`}
        value={firstName}
        onChange={setFirstName}
        placeholder={t`Tim`}
        fullWidth
        disabled={!canEditFirstName}
      />
      <SettingsTextInput
        instanceId={lastNameTextInputId}
        label={t`Last Name`}
        value={lastName}
        onChange={setLastName}
        placeholder={t`Cook`}
        fullWidth
        disabled={!canEditLastName}
      />
    </StyledComboInputContainer>
  );
};
