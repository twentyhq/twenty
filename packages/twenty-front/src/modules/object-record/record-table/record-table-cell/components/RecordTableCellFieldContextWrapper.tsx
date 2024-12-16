import { ReactNode, useContext } from 'react';

import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { SelectFieldHotkeyScope } from '@/object-record/select/types/SelectFieldHotkeyScope';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const RecordTableCellFieldContextWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();

  const { columnDefinition } = useContext(RecordTableCellContext);

  const { recordId } = useRecordTableRowContextOrThrow();

  const updateRecord = useContext(RecordUpdateContext);

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const customHotkeyScope = isFieldRelation(columnDefinition)
    ? RelationPickerHotkeyScope.RelationPicker
    : isFieldSelect(columnDefinition)
      ? SelectFieldHotkeyScope.SelectField
      : TableHotkeyScope.CellEditMode;

  return (
    <FieldContext.Provider
      value={{
        recoilScopeId: recordId + columnDefinition.label,
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        hotkeyScope: customHotkeyScope,
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: columnDefinition.fieldMetadataId,
            name: columnDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
