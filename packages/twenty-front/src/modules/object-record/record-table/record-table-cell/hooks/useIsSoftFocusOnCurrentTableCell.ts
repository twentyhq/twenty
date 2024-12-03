import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsSoftFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const isSoftFocusOnTableCell = useRecoilComponentFamilyValueV2(
    isSoftFocusOnTableCellComponentFamilyState,
    currentTableCellPosition,
  );

  return isSoftFocusOnTableCell;
};
