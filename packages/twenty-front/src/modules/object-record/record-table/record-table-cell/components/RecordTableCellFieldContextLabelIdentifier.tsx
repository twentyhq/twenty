import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
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

  const { recordField } = useContext(RecordTableCellContext);
  const { objectMetadataItem, onRecordIdentifierClick, triggerEvent } =
    useRecordTableContextOrThrow();

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  const updateRecord = useContext(RecordUpdateContext);

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
        useUpdateRecord: () => [updateRecord, {}],
        isLabelIdentifier: true,
        displayedMaxRows: 1,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          isRecordReadOnly: isRecordReadOnly ?? false,
          objectPermissions,
          fieldMetadataItem: {
            id: recordField.fieldMetadataItemId,
            isUIReadOnly: fieldDefinition.metadata.isUIReadOnly ?? false,
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
