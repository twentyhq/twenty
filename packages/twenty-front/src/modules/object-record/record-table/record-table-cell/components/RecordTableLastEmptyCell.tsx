import { useContext } from 'react';

import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useContext(RecordTableRowContext);

  return <RecordTableTd isSelected={isSelected} hasRightBorder={false} />;
};
