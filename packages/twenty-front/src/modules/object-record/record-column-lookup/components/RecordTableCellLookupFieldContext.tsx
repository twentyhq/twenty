import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordTableCellLookupRelatedRecordEffect } from '@/object-record/record-column-lookup/components/RecordTableCellLookupRelatedRecordEffect';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
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

  return (
    <FieldContext.Provider
      value={{
        fieldMetadataItemId: lookupTargetFieldMetadataItem.id,
        recordId: relatedRecordId,
        fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
          field: lookupTargetFieldMetadataItem,
          objectMetadataItem: relationObjectMetadataItem,
        }),
        isLabelIdentifier: false,
        displayedMaxRows: 1,
        isRecordFieldReadOnly: true,
        isForbidden:
          !canReadRelatedRecord ||
          restrictedFieldNames.includes(lookupTargetFieldMetadataItem.name),
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
