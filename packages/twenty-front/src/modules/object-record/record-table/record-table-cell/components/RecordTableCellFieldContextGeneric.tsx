import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useContext, useMemo, type ReactNode } from 'react';
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

  const { objectMetadataItem, objectMetadataItems, objectPermissions } =
    useRecordTableContextOrThrow();

  const {
    objectPermissionsByObjectMetadataId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  let fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  // OMNIA-CUSTOM: For sub-field columns, override the field definition to inject
  // subFieldName into metadata so FieldDisplay routes to RelationSubFieldDisplay.
  // We also look up the sub-field's type/label from the target object metadata.
  if (recordField.subFieldName && fieldDefinition) {
    const targetObjectNameSingular = (
      fieldDefinition.metadata as Record<string, unknown>
    ).relationObjectMetadataNameSingular as string | undefined;

    const targetObjectMetadata = targetObjectNameSingular
      ? objectMetadataItems.find(
          (item) => item.nameSingular === targetObjectNameSingular,
        )
      : undefined;

    const subFieldMeta = targetObjectMetadata?.fields.find(
      (f) => f.name === recordField.subFieldName && f.isActive,
    );

    fieldDefinition = {
      ...fieldDefinition,
      fieldMetadataId: `${fieldDefinition.fieldMetadataId}.${recordField.subFieldName}`,
      label: `${fieldDefinition.label} / ${subFieldMeta?.label ?? recordField.subFieldName}`,
      type: (subFieldMeta?.type ?? fieldDefinition.type) as any,
      isUIReadOnly: true,
      metadata: {
        ...fieldDefinition.metadata,
        subFieldName: recordField.subFieldName,
        isUIReadOnly: true,
      } as any,
    };
  }

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

    if (
      hasObjectReadPermissions &&
      hasJunctionConfig(fieldDefinition.metadata.settings)
    ) {
      const junctionConfig = getJunctionConfig({
        settings: fieldDefinition.metadata.settings,
        relationObjectMetadataId,
        sourceObjectMetadataId: objectMetadataItem.id,
        objectMetadataItems,
      });

      if (isDefined(junctionConfig)) {
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

  // OMNIA-CUSTOM: Memoize context value — this component renders per cell
  // (O(rows × fields)). Without memoization, every parent re-render creates
  // a new object reference, forcing all FieldContext consumers to re-render.
  const useUpdateRecordHook = useMemo(
    () => (): [(params: any) => void, any] => [updateRecord, {}],
    [updateRecord],
  );

  const contextValue = useMemo(
    () => ({
      fieldMetadataItemId: recordField.fieldMetadataItemId,
      recordId,
      fieldDefinition: fieldDefinition,
      useUpdateRecord: useUpdateRecordHook,
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
        isSystemObject: objectMetadataItem.isSystem,
        objectPermissions,
        fieldMetadataItem: {
          id: fieldDefinition.fieldMetadataId,
          isUIReadOnly: fieldDefinition.metadata.isUIReadOnly ?? false,
          isCustom: fieldDefinition.metadata.isCustom ?? false,
        },
      }),
      isForbidden: !hasObjectReadPermissions,
    }),
    [
      recordField.fieldMetadataItemId,
      recordId,
      fieldDefinition,
      useUpdateRecordHook,
      objectMetadataItem,
      isRecordReadOnly,
      objectPermissions,
      hasObjectReadPermissions,
    ],
  );

  return (
    <FieldContext.Provider value={contextValue}>{children}</FieldContext.Provider>
  );
};
