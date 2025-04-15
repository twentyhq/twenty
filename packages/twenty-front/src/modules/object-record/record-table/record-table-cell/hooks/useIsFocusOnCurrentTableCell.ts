import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const isFocusOnTableCell = useRecoilComponentFamilyValueV2(
    isFocusOnTableCellComponentFamilyState,
    currentTableCellPosition,
  );

  return isFocusOnTableCell;
};
