import { useContext } from 'react';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';

export const useCurrentTableCellPosition = () => {
  const { cellPosition } = useContext(RecordTableCellContext);

  return cellPosition;
};
