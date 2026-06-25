import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellFocusedPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFocusedPortal = () => {
  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isUnderHoveredPortal =
    isDefined(recordTableHoverPosition) &&
    isDefined(recordTableFocusPosition) &&
    recordTableHoverPosition.column === recordTableFocusPosition.column &&
    recordTableHoverPosition.row === recordTableFocusPosition.row;

  if (!isDefined(recordTableFocusPosition) || isUnderHoveredPortal) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={recordTableFocusPosition}>
      <RecordTableCellPortalRootContainer zIndex={TABLE_Z_INDEX.hoverPortal}>
        <RecordTableCellFocusedPortalContent />
      </RecordTableCellPortalRootContainer>
    </RecordTableCellPortalWrapper>
  );
};
