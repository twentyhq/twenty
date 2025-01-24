import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useContext, useEffect } from 'react';

export const StorybookFieldInputDropdownFocusIdSetterEffect = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const fieldDropdownFocusIdTableCell = getDropdownFocusIdForRecordField(
    recordId,
    fieldDefinition.fieldMetadataId,
    'table-cell',
  );

  useEffect(() => {
    setActiveDropdownFocusIdAndMemorizePrevious(fieldDropdownFocusIdTableCell);
  }, [
    setActiveDropdownFocusIdAndMemorizePrevious,
    fieldDropdownFocusIdTableCell,
  ]);

  return null;
};
