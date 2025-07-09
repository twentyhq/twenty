import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { RecordTableCellFieldContextLabelIdentifier } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { ReactNode, useContext } from 'react';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type RecordTableCellFieldContextWrapperProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextWrapper = ({
  children,
}: RecordTableCellFieldContextWrapperProps) => {
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId } = useRecordTableRowContextOrThrow();
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const instanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: columnDefinition.metadata.fieldName,
    prefix: RECORD_TABLE_CELL_INPUT_ID_PREFIX,
  });

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: {
      id: columnDefinition.fieldMetadataId,
      name: columnDefinition.metadata.fieldName,
    },
    objectMetadataItem,
  });

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      {isLabelIdentifier ? (
        <RecordTableCellFieldContextLabelIdentifier key={instanceId}>
          {children}
        </RecordTableCellFieldContextLabelIdentifier>
      ) : (
        <RecordTableCellFieldContextGeneric key={instanceId}>
          {children}
        </RecordTableCellFieldContextGeneric>
      )}
    </RecordFieldComponentInstanceContext.Provider>
  );
};
