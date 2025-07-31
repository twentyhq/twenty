import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldIsReadOnly } from '@/object-record/record-field/hooks/useIsFieldReadOnly';
import { isFieldRelationFromManyObjects } from '@/object-record/record-field/types/guards/isFieldRelationFromManyObjects';
import { isFieldRelationToOneObject } from '@/object-record/record-field/types/guards/isFieldRelationToOneObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ReactNode, useContext } from 'react';

type RecordTableCellFieldContextGenericProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextGeneric = ({
  children,
}: RecordTableCellFieldContextGenericProps) => {
  const { recordId, isReadOnly: isTableRowReadOnly } =
    useRecordTableRowContextOrThrow();

  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { indexIdentifierUrl, objectPermissionsByObjectMetadataId } =
    useRecordIndexContextOrThrow();
  const { columnDefinition } = useContext(RecordTableCellContext);

  const isFieldReadOnly = useFieldIsReadOnly({
    objectNameSingular: objectMetadataItem.nameSingular,
    fieldName: columnDefinition.metadata.fieldName,
    fieldType: columnDefinition.type,
    isCustom: objectMetadataItem.isCustom,
    fieldMetadataId: columnDefinition.fieldMetadataId,
    objectMetadataId: objectMetadataItem.id,
  });

  const updateRecord = useContext(RecordUpdateContext);

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  let hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  if (
    isFieldRelationToOneObject(columnDefinition) ||
    isFieldRelationFromManyObjects(columnDefinition)
  ) {
    const relationObjectMetadataId =
      columnDefinition.metadata.relationObjectMetadataId;

    const relationObjectPermissions = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataId,
    );

    hasObjectReadPermissions = relationObjectPermissions.canReadObjectRecords;
  }

  const isReadOnly = (isFieldReadOnly || isTableRowReadOnly) ?? false;

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: columnDefinition.fieldMetadataId,
            name: columnDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
        isReadOnly,
        isForbidden: !hasObjectReadPermissions,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
