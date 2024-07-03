import { useContext } from 'react';

import { StyledRecordTableTd } from '@/object-record/record-table/components/StyledRecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useContext(RecordTableRowContext);

  return <StyledRecordTableTd isSelected={isSelected} />;
};
