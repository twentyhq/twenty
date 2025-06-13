import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useContext } from 'react';

export const useRecordFieldCardRelationPickerDropdownId = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  return `record-field-card-relation-picker-${fieldDefinition.fieldMetadataId}-${recordId}`;
};
