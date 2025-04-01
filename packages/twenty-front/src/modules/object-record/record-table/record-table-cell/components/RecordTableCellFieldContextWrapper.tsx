import { ReactNode, useContext } from 'react';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { RecordTableCellFieldContext } from './RecordTableCellFieldContext';

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
