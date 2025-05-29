import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FormPhoneFieldInput } from '@/object-record/record-field/form-types/components/FormPhoneFieldInput';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type PhoneFieldProps = {
  autoSave?: boolean;
  onPhoneUpdate?: (phone: FieldPhonesValue) => void;
};

export const PhoneField = ({
  autoSave = true,
  onPhoneUpdate,
}: PhoneFieldProps) => {
  const currentUser = useRecoilValue(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [phone, setPhone] = useState(
    currentWorkspaceMember?.userPhone ?? {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: null,
    },
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = useDebouncedCallback(async () => {
    onPhoneUpdate?.(phone);

    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      if (autoSave) {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            userPhone: phone,
          },
        });

        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          userPhone: phone,
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

    const {
      primaryPhoneNumber: currentPrimaryPhoneNumber,
      primaryPhoneCountryCode: currentPrimaryPhoneCountryCode,
      primaryPhoneCallingCode: currentPrimaryPhoneCallingCode,
      additionalPhones: currentAdditionalPhones,
    } = currentWorkspaceMember.userPhone ?? {};

    if (
      (currentPrimaryPhoneNumber !== phone.primaryPhoneNumber ||
        currentPrimaryPhoneCountryCode !== phone.primaryPhoneCountryCode ||
        currentPrimaryPhoneCallingCode !== phone.primaryPhoneCallingCode ||
        JSON.stringify(currentAdditionalPhones) !==
          JSON.stringify(phone.additionalPhones)) &&
      phone.primaryPhoneNumber !== '' &&
      phone.primaryPhoneCountryCode !== '' &&
      phone.primaryPhoneCallingCode !== ''
    ) {
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [phone, currentUser, currentWorkspaceMember, debouncedUpdate, autoSave]);

  return (
    <StyledComboInputContainer>
      <FormPhoneFieldInput
        label="Phone"
        defaultValue={phone}
        onChange={setPhone}
      />
    </StyledComboInputContainer>
  );
};
