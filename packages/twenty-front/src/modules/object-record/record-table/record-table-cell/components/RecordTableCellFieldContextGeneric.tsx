import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useContext, type ReactNode } from 'react';

type RecordTableCellFieldContextGenericProps = {
  recordField: RecordField;
  children: ReactNode;
};

export const RecordTableCellFieldContextGeneric = ({
  recordField,
  children,
}: RecordTableCellFieldContextGenericProps) => {
  const { recordId, isRecordReadOnly } = useRecordTableRowContextOrThrow();

  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const {
    objectPermissionsByObjectMetadataId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const updateRecord = useContext(RecordUpdateContext);

  let hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  // todo @guillim : adjust this to handle morph relations permissions display
  if (
    isFieldRelationManyToOne(fieldDefinition) ||
    isFieldRelationOneToMany(fieldDefinition)
  ) {
    const relationObjectMetadataId =
      fieldDefinition.metadata.relationObjectMetadataId;

    const relationObjectPermissions = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataId,
    );

    hasObjectReadPermissions = relationObjectPermissions.canReadObjectRecords;
  }

  return (
    <FieldContext.Provider
      value={{
        fieldMetadataItemId: recordField.fieldMetadataItemId,
        recordId,
        fieldDefinition: fieldDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: fieldDefinition.fieldMetadataId,
            name: fieldDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          isRecordReadOnly: isRecordReadOnly ?? false,
          objectPermissions,
          fieldMetadataItem: {
            id: fieldDefinition.fieldMetadataId,
            isUIReadOnly: fieldDefinition.metadata.isUIReadOnly ?? false,
          },
        }),
        isForbidden: !hasObjectReadPermissions,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
