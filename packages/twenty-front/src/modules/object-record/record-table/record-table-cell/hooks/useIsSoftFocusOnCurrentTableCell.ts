import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsSoftFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const { isSoftFocusOnTableCellFamilyState } = useRecordTableStates();

  const isSoftFocusOnTableCell = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(currentTableCellPosition),
  );

  return isSoftFocusOnTableCell;
};
