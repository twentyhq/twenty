import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { FieldDoubleText } from '@/object-record/field/types/FieldDoubleText';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { Person } from '@/people/types/Person';
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
  onEntitySelected: (entity?: EntityForSelect | undefined) => void;
  closeDropdown?: () => void;
};

export const AddPersonToCompany = ({
  companyId,
  onEntitySelected,
  closeDropdown,
}: AddPersonToCompanyProps) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const handleEscape = () => {
    goBackToPreviousHotkeyScope();
    closeDropdown?.();
  };

  const { createOneRecord: createPerson } = useCreateOneRecord<Person>({
    objectNameSingular: 'person',
  });

  const handleCreatePerson = async ({
    firstValue,
    secondValue,
  }: FieldDoubleText) => {
    if (!firstValue && !secondValue) return;

    const person = await createPerson({
      companyId,
      id: v4(),
      name: {
        firstName: firstValue,
        lastName: secondValue,
      },
    });

    if (person) {
      const entityForSelect: EntityForSelect = {
        id: person.id,
        name: person.name?.firstName ?? '',
        avatarUrl: person.avatarUrl ?? '',
        avatarType: 'rounded',
        record: person,
      };
      onEntitySelected(entityForSelect);
    }
    goBackToPreviousHotkeyScope();
    closeDropdown?.();
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
