import { RecordFieldLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordFieldLookupFieldContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { RecordTableCellFieldContextLabelIdentifier } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier';
import { isRecordTableCellsNonEditableComponentState } from '@/object-record/record-table/states/isRecordTableCellsNonEditableComponentState';
import { getRecordTableCellInputIdPrefix } from '@/object-record/record-table/utils/getRecordTableCellInputIdPrefix';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const {
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    columnDescriptorByRecordFieldId,
  } = useRecordIndexContextOrThrow();

  const isRecordTableCellsNonEditable = useAtomComponentStateValue(
    isRecordTableCellsNonEditableComponentState,
  );

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldMetadataItem.name,
    prefix: getRecordTableCellInputIdPrefix(recordField.id),
  });

  const isLabelIdentifier =
    labelIdentifierFieldMetadataItem?.id === recordField.fieldMetadataItemId;

  const lookupTarget =
    columnDescriptorByRecordFieldId[recordField.id]?.lookupTarget;

  // The lookup cell keys its own editor instance to the related record
  if (isDefined(lookupTarget)) {
    return (
      <RecordFieldLookupFieldContext
        key={instanceId}
        recordId={recordId}
        fieldMetadataItem={fieldMetadataItem}
        relationObjectMetadataItem={lookupTarget.relationObjectMetadataItem}
        lookupTargetFieldMetadataItem={
          lookupTarget.lookupTargetFieldMetadataItem
        }
        instanceIdPrefix={getRecordTableCellInputIdPrefix(recordField.id)}
        isNonEditable={isRecordTableCellsNonEditable}
        displayedMaxRows={1}
      >
        {children}
      </RecordFieldLookupFieldContext>
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
