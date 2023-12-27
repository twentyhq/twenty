import { useRecoilValue } from 'recoil';

import { isSoftFocusOnTableCellScopedFamilyState } from '../../states/isSoftFocusOnTableCellScopedFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsSoftFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const isSoftFocusOnTableCell = useRecoilValue(
    isSoftFocusOnTableCellScopedFamilyState(currentTableCellPosition),
  );

  return isSoftFocusOnTableCell;
};
