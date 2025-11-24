import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { RecordTitleCellTextFieldInput } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldInput';
import { RecordTitleFullNameFieldInput } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldInput';

type RecordTitleCellFieldInputProps = {
  instanceId: string;
  sizeVariant?: 'xs' | 'sm' | 'md';
};

export const RecordTitleCellFieldInput = ({
  instanceId,
  sizeVariant,
}: RecordTitleCellFieldInputProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  if (!isFieldText(fieldDefinition) && !isFieldFullName(fieldDefinition)) {
    throw new Error('Field definition is not a text or full name field');
  }

  return (
    <>
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellTextFieldInput
          instanceId={instanceId}
          sizeVariant={sizeVariant}
        />
      ) : isFieldFullName(fieldDefinition) ? (
        <RecordTitleFullNameFieldInput sizeVariant={sizeVariant} />
      ) : null}
    </>
  );
};
