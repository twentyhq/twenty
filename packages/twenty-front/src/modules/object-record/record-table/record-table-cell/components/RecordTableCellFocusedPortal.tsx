import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellFocusedPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFocusedPortal = () => {
  const focusPosition = useRecoilComponentValue(
    recordTableFocusPositionComponentState,
  );

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  const isUnderHoveredPortal =
    isDefined(hoverPosition) &&
    isDefined(focusPosition) &&
    hoverPosition.column === focusPosition.column &&
    hoverPosition.row === focusPosition.row;

  if (!isDefined(focusPosition) || isUnderHoveredPortal) {
    return null;
  }

  const isOnFirstScrollableColumn = focusPosition.column === 1;
  const isOnLabelIdentifierStickyColumn = focusPosition.column === 0;

  const zIndexForHoveredPortalOnFirstScrollableColumnWithoutGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withoutGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnFirstScrollableColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withoutGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnFirstScrollableColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withoutGroups.scrolledVerticallyOnly
              .hoverPortalCellOnFirstScrollableColumn
          : TABLE_Z_INDEX.withoutGroups.noScrollAtAll
              .hoverPortalCellOnFirstScrollableColumn;

  const zIndexForHoveredPortalOnLabelIdentifierStickyColumnWithoutGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withoutGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnLabelIdentifierColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withoutGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnLabelIdentifierColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withoutGroups.scrolledVerticallyOnly
              .hoverPortalCellOnLabelIdentifierColumn
          : TABLE_Z_INDEX.withoutGroups.noScrollAtAll
              .hoverPortalCellOnLabelIdentifierColumn;

  const zIndexForHoveredPortalOnNormalColumnWithoutGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withoutGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnNormalColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withoutGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnNormalColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withoutGroups.scrolledVerticallyOnly
              .hoverPortalCellOnNormalColumn
          : TABLE_Z_INDEX.withoutGroups.noScrollAtAll
              .hoverPortalCellOnNormalColumn;

  const zIndexForHoveredPortalWithoutGroups = isOnFirstScrollableColumn
    ? zIndexForHoveredPortalOnFirstScrollableColumnWithoutGroups
    : isOnLabelIdentifierStickyColumn
      ? zIndexForHoveredPortalOnLabelIdentifierStickyColumnWithoutGroups
      : zIndexForHoveredPortalOnNormalColumnWithoutGroups;

  const zIndexForHoveredPortalOnFirstScrollableColumnWithGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnFirstScrollableColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnFirstScrollableColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withGroups.scrolledVerticallyOnly
              .hoverPortalCellOnFirstScrollableColumn
          : TABLE_Z_INDEX.withGroups.noScrollAtAll
              .hoverPortalCellOnFirstScrollableColumn;

  const zIndexForHoveredPortalOnLabelIdentifierStickyColumnWithGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnLabelIdentifierColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnLabelIdentifierColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withGroups.scrolledVerticallyOnly
              .hoverPortalCellOnLabelIdentifierColumn
          : TABLE_Z_INDEX.withGroups.noScrollAtAll
              .hoverPortalCellOnLabelIdentifierColumn;

  const zIndexForHoveredPortalOnNormalColumnWithGroups =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.withGroups.scrolledBothVerticallyAndHorizontally
          .hoverPortalCellOnNormalColumn
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.withGroups.scrolledHorizontallyOnly
            .hoverPortalCellOnNormalColumn
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.withGroups.scrolledVerticallyOnly
              .hoverPortalCellOnNormalColumn
          : TABLE_Z_INDEX.withGroups.noScrollAtAll
              .hoverPortalCellOnNormalColumn;

  const zIndexForHoveredPortalWithGroups = isOnFirstScrollableColumn
    ? zIndexForHoveredPortalOnFirstScrollableColumnWithGroups
    : isOnLabelIdentifierStickyColumn
      ? zIndexForHoveredPortalOnLabelIdentifierStickyColumnWithGroups
      : zIndexForHoveredPortalOnNormalColumnWithGroups;

  const zIndex = hasRecordGroups
    ? zIndexForHoveredPortalWithGroups
    : zIndexForHoveredPortalWithoutGroups;

  return (
    <RecordTableCellPortalWrapper position={focusPosition}>
      <RecordTableCellPortalRootContainer zIndex={zIndex}>
        <RecordTableCellFocusedPortalContent />
      </RecordTableCellPortalRootContainer>
    </RecordTableCellPortalWrapper>
  );
};
