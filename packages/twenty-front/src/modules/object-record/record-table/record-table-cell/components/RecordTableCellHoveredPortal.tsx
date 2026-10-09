import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useIsOnDemandFieldAtRecordTableColumn } from '@/object-record/record-table/hooks/useIsOnDemandFieldAtRecordTableColumn';
import { RecordTableCellHoveredPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellHoveredPortal = () => {
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );
  const isOnDemandField = useIsOnDemandFieldAtRecordTableColumn(
    recordTableHoverPosition?.column,
  );

  if (!isDefined(recordTableHoverPosition) || isOnDemandField) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={recordTableHoverPosition}>
      <RecordTableCellPortalRootContainer zIndex={TABLE_Z_INDEX.hoverPortal}>
        <RecordTableCellHoveredPortalContent />
      </RecordTableCellPortalRootContainer>
    </RecordTableCellPortalWrapper>
  );
};
