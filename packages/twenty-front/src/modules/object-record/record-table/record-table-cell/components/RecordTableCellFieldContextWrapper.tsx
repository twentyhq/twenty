import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { RecordTableCellFieldContextTraversed } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextTraversed';
import { isDefined } from 'twenty-shared/utils';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { RecordTableCellFieldContextLabelIdentifier } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type ReactNode } from 'react';

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
  } = useRecordIndexContextOrThrow();

  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  const isTraversed = isDefined(recordField.relationTargetFieldMetadataItemId);

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    // Two columns through the same relation must not share an input instance.
    fieldName: isTraversed
      ? getRecordFieldKey(recordField)
      : fieldMetadataItem.name,
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  const isLabelIdentifier =
    !isTraversed &&
    labelIdentifierFieldMetadataItem?.id === recordField.fieldMetadataItemId;

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      {isTraversed ? (
        <RecordTableCellFieldContextTraversed
          key={instanceId}
          recordField={recordField}
        >
          {children}
        </RecordTableCellFieldContextTraversed>
      ) : isLabelIdentifier ? (
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
