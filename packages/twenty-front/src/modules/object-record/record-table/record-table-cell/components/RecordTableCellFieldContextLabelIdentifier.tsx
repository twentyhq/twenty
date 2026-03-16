import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { shouldCompactRecordIndexLabelIdentifierComponentState } from '@/object-record/record-index/states/shouldCompactRecordIndexLabelIdentifierComponentState';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback, useContext, useMemo, type ReactNode } from 'react';

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

  const shouldCompactRecordIndexLabelIdentifier = useAtomComponentStateValue(
    shouldCompactRecordIndexLabelIdentifierComponentState,
  );

  const hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  const updateRecord = useContext(RecordUpdateContext);

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  // OMNIA-CUSTOM: Memoize callback and context value — this component renders
  // per label-identifier cell. Without memoization, every parent re-render
  // creates new object/function refs, cascading re-renders to all consumers.
  const handleChipClick = useCallback(() => {
    onRecordIdentifierClick?.(rowIndex, recordId);
  }, [onRecordIdentifierClick, rowIndex, recordId]);

  const useUpdateRecordHook = useMemo(
    () => (): [(params: any) => void, any] => [updateRecord, {}],
    [updateRecord],
  );

  const contextValue = useMemo(
    () => ({
      recordId,
      fieldDefinition,
      useUpdateRecord: useUpdateRecordHook,
      isLabelIdentifier: true,
      isLabelIdentifierCompact: shouldCompactRecordIndexLabelIdentifier,
      displayedMaxRows: 1,
      isRecordFieldReadOnly: isRecordFieldReadOnly({
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
    }),
    [
      recordId,
      fieldDefinition,
      useUpdateRecordHook,
      shouldCompactRecordIndexLabelIdentifier,
      isRecordReadOnly,
      objectMetadataItem,
      objectPermissions,
      recordField.fieldMetadataItemId,
      recordField.size,
      handleChipClick,
      hasObjectReadPermissions,
      triggerEvent,
    ],
  );

  return (
    <FieldContext.Provider value={contextValue}>{children}</FieldContext.Provider>
  );
};
