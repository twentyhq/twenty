import { useSetSoftFocus } from '@/object-record/record-table/record-table-cell/hooks/useSetSoftFocus';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useSetSoftFocusOnCurrentTableCell = () => {
  const setSoftFocus = useSetSoftFocus();

  const currentTableCellPosition = useCurrentTableCellPosition();

  return () => {
    setSoftFocus(currentTableCellPosition);
  };
};
