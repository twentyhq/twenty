import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellHoveredPortalContent } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortalContent';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellHoveredPortal = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { fieldMetadataItemByFieldMetadataItemId, isOnDemandFieldsEnabled } =
    useRecordIndexContextOrThrow();
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  if (!isDefined(recordTableHoverPosition)) {
    return null;
  }

  const recordField = visibleRecordFields[recordTableHoverPosition.column];
  const fieldMetadataItem = isDefined(recordField)
    ? fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId]
    : undefined;

  if (
    getIsOnDemandFieldEnabled({
      isOnDemandFieldsEnabled,
      fieldMetadataItem,
    })
  ) {
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
