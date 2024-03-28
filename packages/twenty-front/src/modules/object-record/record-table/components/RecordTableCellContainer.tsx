import { useContext } from 'react';

import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const RecordTableCellContainer = () => {
  const { objectMetadataItem } = useContext(RecordTableContext);
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId, pathToShowPage } = useContext(RecordTableRowContext);

  const updateRecord = useContext(RecordUpdateContext);

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const customHotkeyScope = isFieldRelation(columnDefinition)
    ? RelationPickerHotkeyScope.RelationPicker
    : TableHotkeyScope.CellEditMode;

  return (
    <FieldContext.Provider
      value={{
        recoilScopeId: recordId + columnDefinition.label,
        entityId: recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        hotkeyScope: customHotkeyScope,
        basePathToShowPage: pathToShowPage,
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: columnDefinition.fieldMetadataId,
            name: columnDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
      }}
    >
      <RecordTableCell customHotkeyScope={{ scope: customHotkeyScope }} />
    </FieldContext.Provider>
  );
};
