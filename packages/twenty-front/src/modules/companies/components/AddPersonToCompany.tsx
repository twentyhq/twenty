import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldDoubleText } from '@/object-record/field/types/FieldDoubleText';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

export const StyledInputContainer = styled.div`
  background-color: transparent;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  width: ${({ theme }) => theme.spacing(62.5)};
  & input,
  div {
    background-color: ${({ theme }) => theme.background.primary};
    width: 100%;
  }
  div {
    border-radius: ${({ theme }) => theme.spacing(1)};
    overflow: hidden;
  }
  input {
    display: flex;
    flex-grow: 1;
    padding: ${({ theme }) => theme.spacing(2)};
  }
`;

type AddPersonToCompanyProps = {
  companyId: string;
  objectNameSingular: string;
  closeDropDown?: () => void;
};

export const AddPersonToCompany = ({
  companyId,
  objectNameSingular,
  closeDropDown,
}: AddPersonToCompanyProps) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular,
  });

  const handleEscape = () => {
    goBackToPreviousHotkeyScope();
    closeDropDown?.();
  };

  const { createOneRecordMutation } = useObjectMetadataItem({
    objectNameSingular: 'person',
  });

  const [createPerson] = useMutation(createOneRecordMutation);

  const handleCreatePerson = async ({
    firstValue,
    secondValue,
  }: FieldDoubleText) => {
    if (!firstValue && !secondValue) return;

    await createPerson({
      variables: {
        input: {
          companyId,
          id: v4(),
          name: {
            firstName: firstValue,
            lastName: secondValue,
          },
        },
      },
      refetchQueries: [getOperationName(findManyRecordsQuery) ?? ''],
    });
    goBackToPreviousHotkeyScope();
    closeDropDown?.();
  };

  return (
    <StyledInputContainer>
      <DoubleTextInput
        firstValue=""
        secondValue=""
        firstValuePlaceholder="First Name"
        secondValuePlaceholder="Last Name"
        onClickOutside={handleEscape}
        onEnter={handleCreatePerson}
        onEscape={handleEscape}
        hotkeyScope={RelationPickerHotkeyScope.AddNew}
      />
    </StyledInputContainer>
  );
};
