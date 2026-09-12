import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
type RecordTableCellFieldContextGenericProps = {
  recordField: RecordField;
  children: ReactNode;
};

export const RecordTableCellFieldContextGeneric = ({
  recordField,
  children,
}: RecordTableCellFieldContextGenericProps) => {
  const { recordId, isRecordReadOnly } = useRecordTableRowContextOrThrow();

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const { objectMetadataItem, objectMetadataItems, objectPermissions } =
    useRecordTableContextOrThrow();

  const {
    objectPermissionsByObjectMetadataId,
    fieldMetadataItemByFieldMetadataItemId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const updateRecord = useContext(RecordTableUpdateContext);

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  let hasObjectReadPermissions = objectPermissions.canReadObjectRecords;
  let isInvalidJunctionRelation = false;

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

    if (hasObjectReadPermissions) {
      const junctionConfig = resolveJunctionConfig({
        settings: fieldDefinition.metadata.settings,
        relationObjectMetadataId,
        relationTargetFieldMetadataId:
          fieldDefinition.metadata.relationFieldMetadataId,
        sourceObjectMetadataId: objectMetadataItem.id,
        objectMetadataItems,
      });

      if (isDefined(junctionConfig)) {
        isInvalidJunctionRelation = !isUsableJunctionConfig(junctionConfig);

        if (isInvalidJunctionRelation) {
          hasObjectReadPermissions = false;
        }

        const targetObjectMetadataIds = junctionConfig.targetFields.flatMap(
          getTargetObjectMetadataIdsFromField,
        );

        if (targetObjectMetadataIds.length > 0) {
          hasObjectReadPermissions = targetObjectMetadataIds.some(
            (targetId) =>
              getObjectPermissionsForObject(
                objectPermissionsByObjectMetadataId,
                targetId,
              ).canReadObjectRecords,
          );
        }
      }
    }
  }

  return (
    <FieldContext.Provider
      value={{
        fieldMetadataItemId: recordField.fieldMetadataItemId,
        recordId,
        fieldDefinition: fieldDefinition,
        useUpdateRecord: updateRecord ? () => [updateRecord, {}] : undefined,
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: fieldDefinition.fieldMetadataId,
            name: fieldDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
        isRecordFieldReadOnly:
          isRecordTableCellsNonEditable ||
          isInvalidJunctionRelation ||
          isRecordFieldReadOnly({
            isRecordReadOnly: isRecordReadOnly ?? false,
            objectPermissions,
            fieldMetadataItem,
            fieldDefinition,
            objectPermissionsByObjectMetadataId,
          }),
        isForbidden: !hasObjectReadPermissions,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
