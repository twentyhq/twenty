import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordTableCellLookupRelatedRecordEffect } from '@/object-record/record-column-lookup/components/RecordTableCellLookupRelatedRecordEffect';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
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

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: relationObjectMetadataItem?.nameSingular ?? '',
  });

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const lookupTargetFieldMetadataItem = relationObjectMetadataItem?.fields.find(
    (field) => field.id === recordField.relationTargetFieldMetadataId,
  );

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

  return (
    <FieldContext.Provider
      value={{
        fieldMetadataItemId: lookupTargetFieldMetadataItem.id,
        recordId: relatedRecordId,
        fieldDefinition,
        useUpdateRecord: useUpdateOneObjectRecordMutation,
        isLabelIdentifier: false,
        displayedMaxRows: 1,
        isRecordFieldReadOnly:
          !isDefined(relatedRecord) ||
          isRecordTableCellsNonEditable ||
          isLookupTargetRestricted ||
          isRecordFieldReadOnly({
            isRecordReadOnly: false,
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
  );
};
