import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import {
  FieldContext,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableUpdateContext } from '@/object-record/record-table/contexts/RecordTableUpdateContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { type RecordTableCellFieldTarget } from '@/object-record/record-table/types/RecordTableCellFieldTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext, type ReactNode } from 'react';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';
type RecordTableCellFieldContextGenericProps = {
  target: RecordTableCellFieldTarget;
  children: ReactNode;
};

export const RecordTableCellFieldContextGeneric = ({
  target: {
    recordId,
    objectMetadataItem,
    fieldMetadataItem,
    fieldDefinition,
    isRecordReadOnly,
    restrictedFieldNames,
    fieldValueKey,
  },
  children,
}: RecordTableCellFieldContextGenericProps) => {
  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const { objectMetadataItems } = useRecordTableContextOrThrow();

  const { objectPermissionsByObjectMetadataId } =
    useRecordIndexContextOrThrow();

  const updateRecord = useContext(RecordTableUpdateContext);

  const updateTargetRecord = (params: RecordUpdateHookParams) =>
    updateRecord?.({
      ...params,
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  let hasObjectReadPermissions = canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    ),
    operationType: 'read',
  });
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

    hasObjectReadPermissions = canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: relationObjectPermissions,
      operationType: 'read',
    });

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
          hasObjectReadPermissions = targetObjectMetadataIds.some((targetId) =>
            canAccessThroughAllRecordsOrRlsPermission({
              objectRecordsPermissions: getObjectPermissionsForObject(
                objectPermissionsByObjectMetadataId,
                targetId,
              ),
              operationType: 'read',
            }),
          );
        }
      }
    }
  }

  const isFieldRestricted = restrictedFieldNames.includes(
    fieldDefinition.metadata.fieldName,
  );

  return (
    <FieldContext.Provider
      value={{
        fieldMetadataItemId: fieldMetadataItem.id,
        recordId,
        fieldDefinition,
        useUpdateRecord: isDefined(updateRecord)
          ? () => [updateTargetRecord, {}]
          : undefined,
        // Label identifier columns of the table get their own context
        isLabelIdentifier: false,
        displayedMaxRows: 1,
        isRecordFieldReadOnly:
          isRecordTableCellsNonEditable ||
          isInvalidJunctionRelation ||
          isFieldRestricted ||
          isRecordFieldReadOnly({
            isRecordReadOnly,
            objectMetadataId: objectMetadataItem.id,
            fieldMetadataItem,
            fieldDefinition,
            objectPermissionsByObjectMetadataId,
          }),
        isForbidden: !hasObjectReadPermissions || isFieldRestricted,
        fieldValueKey,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
