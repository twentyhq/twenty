import { useSetFocus } from '@/object-record/record-table/record-table-cell/hooks/useSetFocus';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useSetFocusOnCurrentTableCell = () => {
  const setFocus = useSetFocus();

  const currentTableCellPosition = useCurrentTableCellPosition();

  return () => {
    setFocus(currentTableCellPosition);
  };
};
