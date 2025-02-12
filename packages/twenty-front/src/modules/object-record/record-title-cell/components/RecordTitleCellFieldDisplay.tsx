import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordTitleCellSingleTextDisplayMode } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldDisplay';
import { RecordTitleFullNameFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldDisplay';
import { useContext } from 'react';

export const RecordTitleCellFieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    <div>
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellSingleTextDisplayMode />
      ) : isFieldFullName(fieldDefinition) ? (
        <RecordTitleFullNameFieldDisplay />
      ) : (
        <></>
      )}
    </div>
  );
};
