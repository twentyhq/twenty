import { useState } from 'react';
import PersonChip from '../chips/PersonChip';
import { EditableDoubleText } from '../editable-cell/EditableDoubleText';

type OwnProps = {
  firstname: string;
  lastname: string;
  onChange: (firstname: string, lastname: string) => void;
};

export function EditablePeopleFullName({
  firstname,
  lastname,
  onChange,
}: OwnProps) {
  const [firstnameValue, setFirstnameValue] = useState(firstname);
  const [lastnameValue, setLastnameValue] = useState(lastname);

  function handleDoubleTextChange(
    firstValue: string,
    secondValue: string,
  ): void {
    setFirstnameValue(firstValue);
    setLastnameValue(secondValue);

    onChange(firstValue, secondValue);
  }

  return (
    <EditableDoubleText
      firstValue={firstnameValue}
      secondValue={lastnameValue}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onChange={handleDoubleTextChange}
      nonEditModeContent={<PersonChip name={firstname + ' ' + lastname} />}
    />
  );
}
