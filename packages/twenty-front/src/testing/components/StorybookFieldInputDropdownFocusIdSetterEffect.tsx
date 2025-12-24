import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useContext, useEffect } from 'react';

export const StorybookFieldInputDropdownFocusIdSetterEffect = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const fieldDropdownFocusIdTableCell = getDropdownFocusIdForRecordField({
    recordId,
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    componentType: 'table-cell',
    instanceId: scopeInstanceId,
  });

  useEffect(() => {
    setActiveDropdownFocusIdAndMemorizePrevious(fieldDropdownFocusIdTableCell);
  }, [
    setActiveDropdownFocusIdAndMemorizePrevious,
    fieldDropdownFocusIdTableCell,
  ]);

  return null;
};
