import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useContext, useEffect } from 'react';

export const StorybookFieldInputDropdownFocusIdSetterEffect = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const fieldDropdownFocusIdTableCell = getDropdownFocusIdForRecordField({
    recordId,
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    componentType: 'table-cell',
    instanceId: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  useEffect(() => {
    setActiveDropdownFocusIdAndMemorizePrevious(fieldDropdownFocusIdTableCell);
  }, [
    setActiveDropdownFocusIdAndMemorizePrevious,
    fieldDropdownFocusIdTableCell,
  ]);

  return null;
};
