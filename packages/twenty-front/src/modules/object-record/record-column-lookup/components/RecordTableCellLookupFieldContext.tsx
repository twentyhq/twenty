import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordTableCellLookupRelatedRecordEffect } from '@/object-record/record-column-lookup/components/RecordTableCellLookupRelatedRecordEffect';
import { findRecordFieldLookupTargetFieldMetadataItem } from '@/object-record/record-column-lookup/utils/findRecordFieldLookupTargetFieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import {
  FieldContext,
  type RecordUpdateHookParams,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { getRecordTableCellInputIdPrefix } from '@/object-record/record-table/utils/getRecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { type ReactNode } from 'react';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';

type RecordTableCellLookupFieldContextProps = {
  recordField: RecordField;
  fieldMetadataItem: FieldMetadataItem;
  children: ReactNode;
};

export const RecordTableCellLookupFieldContext = ({
  recordField,
  fieldMetadataItem,
  children,
}: RecordTableCellLookupFieldContextProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();
  const { objectMetadataItems } = useRecordTableContextOrThrow();
  const {
    objectPermissionsByObjectMetadataId,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const relatedRecord = useRecordFieldValue<ObjectRecord | null>(
    recordId,
    fieldMetadataItem.name,
    fieldDefinitionByFieldMetadataItemId[fieldMetadataItem.id],
  );

  const relatedRecordId = relatedRecord?.id ?? '';

  const restrictedFieldNames = useRecordRestrictedFieldNames(relatedRecordId);

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const isRelatedRecordReadOnly = useIsRecordReadOnly({
    recordId: relatedRecordId,
    objectMetadataId: relationObjectMetadataItem?.id ?? '',
  });

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const lookupTargetFieldMetadataItem =
    findRecordFieldLookupTargetFieldMetadataItem({
      recordField,
      fieldMetadataItem,
      objectMetadataItems,
    });

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(lookupTargetFieldMetadataItem)
  ) {
    return null;
  }

  const canReadRelatedRecord = canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions: getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      relationObjectMetadataItem.id,
    ),
    operationType: 'read',
  });

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: lookupTargetFieldMetadataItem,
    objectMetadataItem: relationObjectMetadataItem,
  });

  const isLookupTargetRestricted = restrictedFieldNames.includes(
    lookupTargetFieldMetadataItem.name,
  );

  const updateRelatedRecord = ({ variables }: RecordUpdateHookParams) =>
    updateOneRecord({
      objectNameSingular: relationObjectMetadataItem.nameSingular,
      idToUpdate: relatedRecordId,
      updateOneRecordInput: variables.updateOneRecordInput,
    });

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId: relatedRecordId,
          fieldName: lookupTargetFieldMetadataItem.name,
          prefix: getRecordTableCellInputIdPrefix(recordField.id),
        }),
      }}
    >
      <FieldContext.Provider
        value={{
          fieldMetadataItemId: lookupTargetFieldMetadataItem.id,
          recordId: relatedRecordId,
          fieldDefinition,
          useUpdateRecord: () => [updateRelatedRecord, {}],
          isLabelIdentifier: false,
          displayedMaxRows: 1,
          isRecordFieldReadOnly:
            !isDefined(relatedRecord) ||
            isRecordTableCellsNonEditable ||
            isLookupTargetRestricted ||
            isRecordFieldReadOnly({
              isRecordReadOnly: isRelatedRecordReadOnly,
              objectMetadataId: relationObjectMetadataItem.id,
              fieldMetadataItem: lookupTargetFieldMetadataItem,
              fieldDefinition,
              objectPermissionsByObjectMetadataId,
            }),
          isForbidden: !canReadRelatedRecord || isLookupTargetRestricted,
        }}
      >
        {isDefined(relatedRecord) && (
          <RecordTableCellLookupRelatedRecordEffect
            relatedRecord={relatedRecord}
          />
        )}
        {children}
      </FieldContext.Provider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
