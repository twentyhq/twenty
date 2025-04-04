import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContext } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContext';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { ReactNode, useContext } from 'react';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const RecordTableCellFieldContextWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { columnDefinition } = useContext(RecordTableCellContext);

  const { recordId } = useRecordTableRowContextOrThrow();

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const instanceId = getRecordFieldInputId(
    recordId,
    columnDefinition.metadata.fieldName,
    'record-table-cell',
  );

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordTableCellFieldContext>{children}</RecordTableCellFieldContext>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
