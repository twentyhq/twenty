import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { recordTableRowIndexesBelowHeaderComponentSelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexesBelowHeaderComponentSelector';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableCellOutlinePortal = (
  position: TableCellPosition | null,
) => {
  const isRecordTableScrolledHorizontally = useAtomComponentStateValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const recordTableRowIndexesBelowHeader = useAtomComponentSelectorValue(
    recordTableRowIndexesBelowHeaderComponentSelector,
  );

  const isLeftEdgeOverStickyColumn =
    position?.column === 1 && !isRecordTableScrolledHorizontally;

  return {
    zIndex: isLeftEdgeOverStickyColumn
      ? TABLE_Z_INDEX.cell.sticky
      : TABLE_Z_INDEX.hoverPortal,
    isTopEdgeCoveredByHeader:
      isDefined(position) &&
      recordTableRowIndexesBelowHeader.includes(position.row),
  };
};
