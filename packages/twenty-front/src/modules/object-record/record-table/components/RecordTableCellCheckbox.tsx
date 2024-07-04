import { useContext } from 'react';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableCellCheckbox = () => {
  const { isSelected, isDragging } = useContext(RecordTableRowContext);

  return (
    <RecordTableTd isSelected={isSelected}>
      {!isDragging && <CheckboxCell />}
    </RecordTableTd>
  );
};
