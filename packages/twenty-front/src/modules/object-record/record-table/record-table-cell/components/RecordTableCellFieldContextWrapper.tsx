import { useRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useRecordFieldLookupTarget';
import { RecordTableCellLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordTableCellLookupFieldContext';
import { useScopedRelationAlias } from '@/object-record/record-column-scope/hooks/useScopedRelationAlias';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { RecordTableCellFieldContextLabelIdentifier } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier';
import { getRecordTableCellInputIdPrefix } from '@/object-record/record-table/utils/getRecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableCellFieldContextWrapperProps = {
  children: ReactNode;
  recordField: RecordField;
};

export const RecordTableCellFieldContextWrapper = ({
  recordField,
  children,
}: RecordTableCellFieldContextWrapperProps) => {
  const { recordId, isRecordReadOnly, restrictedFieldNames } =
    useRecordTableRowContextOrThrow();

  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const {
    fieldMetadataItemByFieldMetadataItemId,
    fieldDefinitionByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
  } = useRecordIndexContextOrThrow();

  const lookupTarget = useRecordFieldLookupTarget(recordField);

  const scopedRelationAlias = useScopedRelationAlias(recordField.id);

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldMetadataItem.name,
    prefix: getRecordTableCellInputIdPrefix(recordField.id),
  });

  const isLabelIdentifier =
    labelIdentifierFieldMetadataItem?.id === recordField.fieldMetadataItemId;

  const isScopedRelationRestricted = scopedRelationAlias?.isRestricted ?? false;

  if (isDefined(lookupTarget)) {
    return (
      <RecordTableCellLookupFieldContext
        key={instanceId}
        recordFieldId={recordField.id}
        fieldMetadataItem={fieldMetadataItem}
        lookupTarget={lookupTarget}
      >
        {children}
      </RecordTableCellLookupFieldContext>
    );
  }

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      {isLabelIdentifier ? (
        <RecordTableCellFieldContextLabelIdentifier key={instanceId}>
          {children}
        </RecordTableCellFieldContextLabelIdentifier>
      ) : (
        <RecordTableCellFieldContextGeneric
          key={instanceId}
          target={{
            recordId,
            objectMetadataItem,
            fieldMetadataItem,
            fieldDefinition:
              fieldDefinitionByFieldMetadataItemId[
                recordField.fieldMetadataItemId
              ],
            // A scoped relation only lists part of the related records, which the relation picker cannot edit
            isRecordReadOnly:
              (isRecordReadOnly ?? false) || isDefined(scopedRelationAlias),
            restrictedFieldNames: isScopedRelationRestricted
              ? [...restrictedFieldNames, fieldMetadataItem.name]
              : restrictedFieldNames,
            fieldValueKey: scopedRelationAlias?.responseKey,
          }}
        >
          {children}
        </RecordTableCellFieldContextGeneric>
      )}
    </RecordFieldComponentInstanceContext.Provider>
  );
};
