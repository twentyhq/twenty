import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { isLookupTargetFieldReadable } from '@/object-record/record-column-lookup/utils/isLookupTargetFieldReadable';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { getRecordTableCellInputIdPrefix } from '@/object-record/record-table/utils/getRecordTableCellInputIdPrefix';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableCellLookupFieldContextProps = {
  recordFieldId: string;
  fieldMetadataItem: FieldMetadataItem;
  lookupTarget: RecordFieldLookupTarget;
  children: ReactNode;
};

export const RecordTableCellLookupFieldContext = ({
  recordFieldId,
  fieldMetadataItem,
  lookupTarget: {
    relationObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition,
  },
  children,
}: RecordTableCellLookupFieldContextProps) => {
  const { recordId, isRecordReadOnly: isRowReadOnly } =
    useRecordTableRowContextOrThrow();
  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const relatedRecord = useRecordFieldValue<ObjectRecord | null>(
    recordId,
    fieldMetadataItem.name,
    fieldDefinitionByFieldMetadataItemId[fieldMetadataItem.id],
  );

  const relatedRecordId = relatedRecord?.id ?? '';

  const restrictedFieldNames = useRecordRestrictedFieldNames(relatedRecordId);

  const isRelatedRecordReadOnly = useIsRecordReadOnly({
    recordId: relatedRecordId,
    objectMetadataId: relationObjectMetadataItem.id,
  });

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: getRecordFieldInputInstanceId({
          recordId: relatedRecordId,
          fieldName: lookupTargetFieldMetadataItem.name,
          prefix: getRecordTableCellInputIdPrefix(recordFieldId),
        }),
      }}
    >
      <RecordTableCellFieldContextGeneric
        target={{
          recordId: relatedRecordId,
          objectMetadataItem: relationObjectMetadataItem,
          fieldMetadataItem: lookupTargetFieldMetadataItem,
          fieldDefinition: lookupTargetFieldDefinition,
          isRecordReadOnly:
            !isDefined(relatedRecord) ||
            isRowReadOnly === true ||
            isRelatedRecordReadOnly,
          restrictedFieldNames: isLookupTargetFieldReadable({
            relationObjectMetadataItem,
            lookupTargetFieldMetadataItem,
          })
            ? restrictedFieldNames
            : [...restrictedFieldNames, lookupTargetFieldMetadataItem.name],
        }}
      >
        {children}
      </RecordTableCellFieldContextGeneric>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
