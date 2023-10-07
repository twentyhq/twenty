import { useRecoilValue } from 'recoil';

import { isSoftFocusOnTableCellFamilyState } from '../../states/isSoftFocusOnTableCellFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsSoftFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const isSoftFocusOnTableCell = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(currentTableCellPosition),
  );

  return isSoftFocusOnTableCell;
};
