import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { isFieldUuid } from '@/object-record/record-field/ui/types/guards/isFieldUuid';
import { RecordTitleCellSingleTextDisplayMode } from '@/object-record/record-title-cell/components/RecordTitleCellTextFieldDisplay';
import { RecordTitleFullNameFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleFullNameFieldDisplay';
import { RecordTitleCellUuidFieldDisplay } from '@/object-record/record-title-cell/components/RecordTitleCellUuidFieldDisplay';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useContext } from 'react';

export const RecordTitleCellFieldDisplay = ({
  containerType,
}: {
  containerType: RecordTitleCellContainerType;
}) => {
  const { fieldDefinition } = useContext(FieldContext);

  if (
    !isFieldText(fieldDefinition) &&
    !isFieldFullName(fieldDefinition) &&
    !isFieldUuid(fieldDefinition)
  ) {
    throw new Error('Field definition is not a text, full name, or UUID field');
  }

  return (
    <>
      {isFieldText(fieldDefinition) ? (
        <RecordTitleCellSingleTextDisplayMode containerType={containerType} />
      ) : isFieldFullName(fieldDefinition) ? (
        <RecordTitleFullNameFieldDisplay containerType={containerType} />
      ) : isFieldUuid(fieldDefinition) ? (
        <RecordTitleCellUuidFieldDisplay containerType={containerType} />
      ) : null}
    </>
  );
};
