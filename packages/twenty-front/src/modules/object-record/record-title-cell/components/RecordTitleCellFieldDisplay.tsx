import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTitleCellSingleTextDisplayMode } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldDisplay';
import { RecordTitleFullNameFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldDisplay';
import { useContext } from 'react';

export const RecordTitleCellFieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  if (!isFieldText(fieldDefinition) && !isFieldFullName(fieldDefinition)) {
    throw new Error('Field definition is not a text or full name field');
  }

  return (
    <>
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellSingleTextDisplayMode />
      ) : isFieldFullName(fieldDefinition) ? (
        <RecordTitleFullNameFieldDisplay />
      ) : null}
    </>
  );
};
