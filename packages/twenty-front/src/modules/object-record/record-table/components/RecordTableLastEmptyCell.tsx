import { useContext } from 'react';

import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useContext(RecordTableRowContext);

  return <RecordTableTd isSelected={isSelected} />;
};
