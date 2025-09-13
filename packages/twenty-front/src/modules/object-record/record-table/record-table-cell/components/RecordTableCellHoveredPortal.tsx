import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellHoveredPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';

export const RecordTableCellHoveredPortal = () => {
  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  if (!hoverPosition) {
    return null;
  }

  const isOnFirstScrollableColumn = hoverPosition.column === 1;
  const isOnLabelIdentifierStickyColumn = hoverPosition.column === 0;

  const zIndexForFirstScrollableColumn =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnFirstScrollableColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly
            .hoverPortalCellOnFirstScrollableColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly
              .hoverPortalCellOnFirstScrollableColumn
          : TABLE_Z_INDEX.noScrollAtAll.hoverPortalCellOnFirstScrollableColumn;

  const zIndexForLabelIdentifierStickyColumn =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnLabelIdentifierColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly
            .hoverPortalCellOnLabelIdentifierColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly
              .hoverPortalCellOnLabelIdentifierColumn
          : TABLE_Z_INDEX.noScrollAtAll.hoverPortalCellOnLabelIdentifierColumn;

  const zIndexForNormalColumn =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnNormalColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.hoverPortalCellOnNormalColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.hoverPortalCellOnNormalColumn
          : TABLE_Z_INDEX.noScrollAtAll.hoverPortalCellOnNormalColumn;

  const zIndex = isOnFirstScrollableColumn
    ? zIndexForFirstScrollableColumn
    : isOnLabelIdentifierStickyColumn
      ? zIndexForLabelIdentifierStickyColumn
      : zIndexForNormalColumn;

  return (
    <RecordTableCellPortalWrapper position={hoverPosition}>
      <RecordTableCellPortalRootContainer zIndex={zIndex}>
        <RecordTableCellHoveredPortalContent />
      </RecordTableCellPortalRootContainer>
    </RecordTableCellPortalWrapper>
  );
};
