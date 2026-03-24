import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { shouldCompactRecordIndexLabelIdentifierComponentState } from '@/object-record/record-index/states/shouldCompactRecordIndexLabelIdentifierComponentState';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext, type ReactNode } from 'react';

type RecordTableCellFieldContextLabelIdentifierProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextLabelIdentifier = ({
  children,
}: RecordTableCellFieldContextLabelIdentifierProps) => {
  const {
    objectPermissionsByObjectMetadataId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();
  const { recordId, isRecordReadOnly, rowIndex } =
    useRecordTableRowContextOrThrow();

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const { recordField } = useContext(RecordTableCellContext);
  const { objectMetadataItem, onRecordIdentifierClick, triggerEvent } =
    useRecordTableContextOrThrow();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const shouldCompactRecordIndexLabelIdentifier = useAtomComponentStateValue(
    shouldCompactRecordIndexLabelIdentifierComponentState,
  );

  const hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  const updateRecord = useContext(RecordTableUpdateContext);

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const handleChipClick = () => {
    onRecordIdentifierClick?.(rowIndex, recordId);
  };

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition,
        useUpdateRecord: updateRecord ? () => [updateRecord, {}] : undefined,
        isLabelIdentifier: true,
        isLabelIdentifierCompact: shouldCompactRecordIndexLabelIdentifier,
        displayedMaxRows: 1,
        isRecordFieldReadOnly:
          isRecordTableCellsNonEditable ||
          isRecordFieldReadOnly({
            isRecordReadOnly: isRecordReadOnly ?? false,
            isSystemObject: objectMetadataItem.isSystem,
            objectPermissions,
            fieldMetadataItem: {
              id: recordField.fieldMetadataItemId,
              isUIReadOnly: fieldDefinition.metadata.isUIReadOnly ?? false,
              isCustom: fieldDefinition.metadata.isCustom ?? false,
            },
          }),
        maxWidth: recordField.size,
        onRecordChipClick: handleChipClick,
        isForbidden: !hasObjectReadPermissions,
        triggerEvent,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
