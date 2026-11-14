import { RecordTableCellLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordTableCellLookupFieldContext';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
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
  const { recordId } = useRecordTableRowContextOrThrow();
  const { objectMetadataItems } = useRecordTableContextOrThrow();

  const {
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
  } = useRecordIndexContextOrThrow();

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldMetadataItem.name,
    prefix: getRecordTableCellInputIdPrefix(recordField.id),
  });

  const isLabelIdentifier =
    labelIdentifierFieldMetadataItem?.id === recordField.fieldMetadataItemId;

  const lookupTarget = getRecordFieldLookupTarget({
    recordField,
    fieldMetadataItem,
    objectMetadataItems,
  });

  // The lookup cell keys its own editor instance to the related record
  if (isDefined(lookupTarget)) {
    return (
      <RecordTableCellLookupFieldContext
        key={instanceId}
        recordFieldId={recordField.id}
        fieldMetadataItem={fieldMetadataItem}
        relationObjectMetadataItem={lookupTarget.relationObjectMetadataItem}
        lookupTargetFieldMetadataItem={
          lookupTarget.lookupTargetFieldMetadataItem
        }
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
          recordField={recordField}
        >
          {children}
        </RecordTableCellFieldContextGeneric>
      )}
    </RecordFieldComponentInstanceContext.Provider>
  );
};
